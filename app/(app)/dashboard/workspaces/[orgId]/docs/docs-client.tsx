'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FolderClosed, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DashboardHomeSkeleton,
  ErrorNotice,
  PageHeader,
  SectionCard,
} from '@/components/dashboard'

type RecentDoc = {
  doc_type: string
  doc_id: string
  title: string
  source?: string | null
  visibility?: string | null
  created_by?: string | null
  updated_at?: string
  views_30d?: number
  guided_completions_30d?: number
  status?: string
}

type DocsBootstrapResponse = {
  recents?: {
    recents?: RecentDoc[]
  } | null
  myAssignments?: {
    assignments?: Array<{ task?: { title?: string } | null }>
  } | null
  error?: string
}

const formatRelative = (value?: string) => {
  if (!value) return 'No activity yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function DocsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState<RecentDoc[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/docs/bootstrap`,
          { cache: 'no-store' }
        )

        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/docs`)
          return
        }

        const payload = (await response.json().catch(() => null)) as DocsBootstrapResponse | null
        if (!response.ok || !payload?.recents?.recents) {
          throw new Error('Unable to load documents.')
        }

        if (!active) return
        setDocs(payload.recents.recents ?? [])
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load documents.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [orgId, router])

  const filteredDocs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return docs
    return docs.filter((doc) => {
      const text = `${doc.title} ${doc.source ?? ''} ${doc.status ?? ''}`.toLowerCase()
      return text.includes(normalized)
    })
  }, [docs, query])

  const sharedDocs = filteredDocs.filter((doc) => (doc.visibility ?? 'org_shared') !== 'private_to_user')
  const privateDocs = filteredDocs.filter((doc) => (doc.visibility ?? '') === 'private_to_user')

  if (loading) {
    return <DashboardHomeSkeleton />
  }

  if (error) {
    return <ErrorNotice title="Unable to load documents" message={error} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Shared and private guides with folder-style organization."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}/home`}
        backLabel="Back to home"
        badges={
          <>
            <Badge variant="neutral">Guides</Badge>
            <Badge variant="info">Shared + Private</Badge>
          </>
        }
      />

      <SectionCard
        title="Library"
        description="Search docs, switch visibility space, and keep unsorted docs tidy."
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <InputGroup className="max-w-xl">
            <InputGroupAddon>
              <InputGroupText>
                <Search className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documents"
            />
          </InputGroup>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            <FolderClosed className="mr-2 inline size-4" />
            Shared / Unsorted
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            <FolderClosed className="mr-2 inline size-4" />
            Private / Unsorted
          </div>
        </div>
      </SectionCard>

      <Tabs defaultValue="shared">
        <TabsList>
          <TabsTrigger value="shared">Shared ({sharedDocs.length})</TabsTrigger>
          <TabsTrigger value="private">Private ({privateDocs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="shared" className="space-y-3 pt-1">
          {sharedDocs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No shared docs yet.
            </div>
          )}
          {sharedDocs.map((doc) => (
            <Link
              key={doc.doc_id}
              href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(doc.doc_id)}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{doc.title}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.source ?? 'Guide'} · Updated {formatRelative(doc.updated_at)}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>{doc.views_30d ?? 0} views</div>
                <div>{doc.guided_completions_30d ?? 0} completions</div>
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="private" className="space-y-3 pt-1">
          {privateDocs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No private docs yet.
            </div>
          )}
          {privateDocs.map((doc) => (
            <Link
              key={doc.doc_id}
              href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(doc.doc_id)}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{doc.title}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.source ?? 'Guide'} · Updated {formatRelative(doc.updated_at)}
                </div>
              </div>
              <Badge variant="neutral">Private</Badge>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
