'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FolderClosed, Search, Trash2, Bookmark, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DashboardHomeSkeleton,
  ErrorNotice,
  MetricCard,
  PageHeader,
  SectionCard,
} from '@/components/dashboard'

type LibraryDoc = {
  doc_type: 'guide'
  doc_id: string
  title: string
  source?: string | null
  visibility?: string | null
  created_by?: string | null
  updated_at?: string
  views_30d?: number
  guided_completions_30d?: number
  status?: string
  collection_ids?: string[]
  is_saved?: boolean
  is_trashed?: boolean
  deleted_at?: string | null
  purge_after?: string | null
}

type CollectionRecord = {
  collection_id: string
  name: string
  scope: 'shared' | 'private'
  status: 'active' | 'deleted'
  item_count?: number
}

type TrashRow = {
  workflow_id: string
  deleted_at?: string
  purge_after?: string
  doc?: LibraryDoc | null
}

type DocsBootstrapResponse = {
  library?: {
    docs?: LibraryDoc[]
    collections?: CollectionRecord[]
    trash?: TrashRow[]
    saved_doc_ids?: string[]
  } | null
  myAssignments?: {
    assignments?: Array<unknown>
  } | null
  error?: string
}

const formatRelative = (value?: string) => {
  if (!value) return 'No activity yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DocsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState<LibraryDoc[]>([])
  const [collections, setCollections] = useState<CollectionRecord[]>([])
  const [trash, setTrash] = useState<TrashRow[]>([])
  const [openAssignmentCount, setOpenAssignmentCount] = useState(0)
  const [query, setQuery] = useState('')
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [createFolderName, setCreateFolderName] = useState('')
  const [createFolderScope, setCreateFolderScope] = useState<'shared' | 'private'>('shared')
  const [pendingDocId, setPendingDocId] = useState<string | null>(null)
  const [creatingFolder, setCreatingFolder] = useState(false)

  const load = useCallback(async () => {
    const response = await fetch(
      `/api/orgs/${encodeURIComponent(orgId)}/docs/bootstrap`,
      { cache: 'no-store' }
    )

    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/docs`)
      return
    }

    const payload = (await response.json().catch(() => null)) as DocsBootstrapResponse | null
    if (!response.ok || !payload?.library) {
      throw new Error('Unable to load documents.')
    }

    setDocs(payload.library.docs ?? [])
    setCollections((payload.library.collections ?? []).filter((entry) => entry.status !== 'deleted'))
    setTrash(payload.library.trash ?? [])
    setOpenAssignmentCount(payload.myAssignments?.assignments?.length ?? 0)
  }, [orgId, router])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await load()
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load documents.')
        setLoading(false)
      }
    }
    run()

    return () => {
      active = false
    }
  }, [load])

  const filteredDocs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const matchesQuery = (doc: LibraryDoc) => {
      if (!normalized) return true
      const text = `${doc.title} ${doc.source ?? ''} ${doc.status ?? ''}`.toLowerCase()
      return text.includes(normalized)
    }

    const matchesCollection = (doc: LibraryDoc) => {
      if (collectionFilter === 'all') return true
      if (collectionFilter === 'unsorted') return (doc.collection_ids ?? []).length === 0
      return (doc.collection_ids ?? []).includes(collectionFilter)
    }

    return docs.filter((doc) => !doc.is_trashed).filter(matchesQuery).filter(matchesCollection)
  }, [collectionFilter, docs, query])

  const sharedDocs = filteredDocs.filter((doc) => (doc.visibility ?? 'org_shared') !== 'private_to_user')
  const privateDocs = filteredDocs.filter((doc) => (doc.visibility ?? '') === 'private_to_user')
  const savedDocs = filteredDocs.filter((doc) => doc.is_saved)

  const withMutation = async (docId: string, run: () => Promise<void>) => {
    if (!csrfToken) return
    setPendingDocId(docId)
    setError(null)
    try {
      await run()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setPendingDocId(null)
    }
  }

  const saveDoc = async (docId: string) => {
    await withMutation(docId, async () => {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/docs/${encodeURIComponent(docId)}/saved`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken ?? '',
        },
      })
      if (!response.ok) {
        throw new Error('Unable to save guide.')
      }
    })
  }

  const unsaveDoc = async (docId: string) => {
    await withMutation(docId, async () => {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/docs/${encodeURIComponent(docId)}/saved`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken ?? '',
        },
      })
      if (!response.ok) {
        throw new Error('Unable to remove saved guide.')
      }
    })
  }

  const trashDoc = async (docId: string) => {
    await withMutation(docId, async () => {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/docs/${encodeURIComponent(docId)}/trash`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken ?? '',
        },
      })
      if (!response.ok) {
        throw new Error('Unable to move guide to trash.')
      }
    })
  }

  const restoreDoc = async (docId: string) => {
    await withMutation(docId, async () => {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/docs/${encodeURIComponent(docId)}/restore`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken ?? '',
        },
      })
      if (!response.ok) {
        throw new Error('Unable to restore guide.')
      }
    })
  }

  const moveDoc = async (docId: string, nextCollectionId: string, currentCollectionIds: string[]) => {
    await withMutation(docId, async () => {
      if (nextCollectionId === 'unsorted') {
        await Promise.all(
          currentCollectionIds.map(async (collectionId) => {
            const response = await fetch(
              `/api/orgs/${encodeURIComponent(orgId)}/collections/${encodeURIComponent(collectionId)}/items`,
              {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  'x-csrf-token': csrfToken ?? '',
                },
                body: JSON.stringify({ action: 'remove', doc_id: docId }),
              }
            )
            if (!response.ok) {
              throw new Error('Unable to remove guide from folder.')
            }
          })
        )
        return
      }

      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/collections/${encodeURIComponent(nextCollectionId)}/items`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrfToken ?? '',
          },
          body: JSON.stringify({ action: 'move', doc_id: docId }),
        }
      )
      if (!response.ok) {
        throw new Error('Unable to move guide.')
      }
    })
  }

  const createCollection = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!csrfToken || !createFolderName.trim() || creatingFolder) return

    setCreatingFolder(true)
    setError(null)
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/collections`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: createFolderName.trim(),
          scope: createFolderScope,
        }),
      })
      if (!response.ok) {
        throw new Error('Unable to create folder.')
      }
      setCreateFolderName('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create folder.')
    } finally {
      setCreatingFolder(false)
    }
  }

  if (loading) {
    return <DashboardHomeSkeleton />
  }

  if (error && docs.length === 0 && trash.length === 0) {
    return <ErrorNotice title="Unable to load documents" message={error} />
  }

  const renderDocCard = (doc: LibraryDoc) => {
    const primaryCollectionId = doc.collection_ids?.[0] ?? 'unsorted'

    return (
      <div
        key={doc.doc_id}
        className="space-y-3 rounded-xl border border-border bg-card px-4 py-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(doc.doc_id)}`}
              className="truncate text-sm font-semibold text-foreground hover:underline"
            >
              {doc.title}
            </Link>
            <div className="text-xs text-muted-foreground">
              {doc.source ?? 'Guide'} · Updated {formatRelative(doc.updated_at)}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>{doc.views_30d ?? 0} views</div>
            <div>{doc.guided_completions_30d ?? 0} completions</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{doc.status ?? 'draft'}</Badge>
          {(doc.collection_ids ?? []).length === 0 && <Badge variant="info">Unsorted</Badge>}
          {(doc.collection_ids ?? []).map((collectionId) => {
            const collection = collections.find((entry) => entry.collection_id === collectionId)
            if (!collection) return null
            return (
              <Badge key={`${doc.doc_id}-${collectionId}`} variant="neutral">
                {collection.name}
              </Badge>
            )
          })}
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <Select
            value={primaryCollectionId}
            onValueChange={(value) => void moveDoc(doc.doc_id, value, doc.collection_ids ?? [])}
            disabled={!csrfToken || pendingDocId === doc.doc_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Move to folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unsorted">Unsorted</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection.collection_id} value={collection.collection_id}>
                  {collection.scope === 'private' ? `Private · ${collection.name}` : `Shared · ${collection.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {doc.is_saved ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void unsaveDoc(doc.doc_id)}
              disabled={!csrfToken || pendingDocId === doc.doc_id}
            >
              <Bookmark className="size-4" />
              Unsave
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void saveDoc(doc.doc_id)}
              disabled={!csrfToken || pendingDocId === doc.doc_id}
            >
              <Bookmark className="size-4" />
              Save
            </Button>
          )}

          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(doc.doc_id)}`}>
              Open
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => void trashDoc(doc.doc_id)}
            disabled={!csrfToken || pendingDocId === doc.doc_id}
          >
            <Trash2 className="size-4" />
            Trash
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Shared and private guides with folders, saved docs, and trash restore."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}/home`}
        backLabel="Back to home"
        badges={
          <>
            <Badge variant="neutral">Guides</Badge>
            <Badge variant="info">Folders + Saved + Trash</Badge>
          </>
        }
      />

      {error && <ErrorNotice title="Document action failed" message={error} />}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Visible docs" value={docs.filter((doc) => !doc.is_trashed).length} helper="Shared + private" />
        <MetricCard label="Saved docs" value={docs.filter((doc) => doc.is_saved && !doc.is_trashed).length} helper="Pinned by you" />
        <MetricCard label="Folders" value={collections.length} helper="Shared and private" />
        <MetricCard label="Open assignments" value={openAssignmentCount} helper="Due from tasks" />
      </div>

      <SectionCard
        title="Library controls"
        description="Search guides, filter by folder, and manage private/shared folders."
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
          <InputGroup className="max-w-xl">
            <InputGroupAddon>
              <InputGroupText>
                <Search className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guides"
            />
          </InputGroup>

          <Select value={collectionFilter} onValueChange={setCollectionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All folders</SelectItem>
              <SelectItem value="unsorted">Unsorted</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection.collection_id} value={collection.collection_id}>
                  {collection.scope === 'private' ? `Private · ${collection.name}` : `Shared · ${collection.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]" onSubmit={createCollection}>
          <div>
            <Label htmlFor="folder-name" className="mb-1.5 block">New folder</Label>
            <Input
              id="folder-name"
              value={createFolderName}
              onChange={(event) => setCreateFolderName(event.target.value)}
              placeholder="Onboarding"
            />
          </div>
          <div>
            <Label htmlFor="folder-scope" className="mb-1.5 block">Visibility</Label>
            <Select value={createFolderScope} onValueChange={(value: 'shared' | 'private') => setCreateFolderScope(value)}>
              <SelectTrigger id="folder-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={!csrfToken || creatingFolder || !createFolderName.trim()}>
              <FolderClosed className="size-4" />
              Create folder
            </Button>
          </div>
        </form>
      </SectionCard>

      <Tabs defaultValue="shared">
        <TabsList>
          <TabsTrigger value="shared">Shared ({sharedDocs.length})</TabsTrigger>
          <TabsTrigger value="private">Private ({privateDocs.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedDocs.length})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({trash.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="shared" className="space-y-3 pt-1">
          {sharedDocs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No shared docs yet.
            </div>
          )}
          {sharedDocs.map(renderDocCard)}
        </TabsContent>

        <TabsContent value="private" className="space-y-3 pt-1">
          {privateDocs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No private docs yet.
            </div>
          )}
          {privateDocs.map(renderDocCard)}
        </TabsContent>

        <TabsContent value="saved" className="space-y-3 pt-1">
          {savedDocs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No saved docs yet.
            </div>
          )}
          {savedDocs.map(renderDocCard)}
        </TabsContent>

        <TabsContent value="trash" className="space-y-3 pt-1">
          {trash.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              Trash is empty.
            </div>
          )}
          {trash.map((entry) => (
            <div key={entry.workflow_id} className="rounded-xl border border-border bg-card px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {entry.doc?.title ?? entry.workflow_id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Deleted {formatDate(entry.deleted_at)} · Purges {formatDate(entry.purge_after)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void restoreDoc(entry.workflow_id)}
                  disabled={!csrfToken || pendingDocId === entry.workflow_id}
                >
                  <RotateCcw className="size-4" />
                  Restore
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
