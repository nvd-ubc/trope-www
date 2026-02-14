'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
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
import {
  DashboardHomeSkeleton,
  ErrorNotice,
  MetricCard,
  PageHeader,
  SectionCard,
} from '@/components/dashboard'

type TaskRecord = {
  task_id: string
  title: string
  status: string
  due_at?: string
  doc_type?: string | null
  doc_id?: string | null
  assignment_counts?: {
    total?: number
    completed?: number
    open?: number
    overdue?: number
  }
}

type AssignmentRecord = {
  assignment_id: string
  task_id: string
  status: string
  derived_status?: string
  due_at?: string
  task?: {
    title?: string
    task_id?: string
  } | null
}

type TeammateRecord = {
  user_id: string
  primary_label: string
}

type TasksBootstrapResponse = {
  tasks?: { tasks?: TaskRecord[] } | null
  myAssignments?: { assignments?: AssignmentRecord[] } | null
  teammates?: { teammates?: TeammateRecord[] } | null
  error?: string
}

const formatDate = (value?: string) => {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusVariant = (status: string): 'neutral' | 'warning' | 'danger' | 'success' => {
  if (status === 'completed') return 'success'
  if (status === 'overdue') return 'danger'
  if (status === 'in_progress') return 'warning'
  return 'neutral'
}

export default function TasksClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [teammates, setTeammates] = useState<TeammateRecord[]>([])
  const [creating, setCreating] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createDueDate, setCreateDueDate] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('')
  const [completingAssignmentId, setCompletingAssignmentId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const response = await fetch(
      `/api/orgs/${encodeURIComponent(orgId)}/tasks/bootstrap`,
      { cache: 'no-store' }
    )

    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/tasks`)
      return
    }

    const payload = (await response.json().catch(() => null)) as TasksBootstrapResponse | null
    if (!response.ok || !payload?.tasks || !payload.myAssignments || !payload.teammates) {
      throw new Error('Unable to load tasks.')
    }

    setTasks(payload.tasks.tasks ?? [])
    setAssignments(payload.myAssignments.assignments ?? [])
    setTeammates((payload.teammates.teammates ?? []).map((entry) => ({
      user_id: entry.user_id,
      primary_label: entry.primary_label,
    }))) 
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
        setError(err instanceof Error ? err.message : 'Unable to load tasks.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [load])

  const myOpenAssignments = useMemo(
    () => assignments.filter((assignment) => (assignment.derived_status ?? assignment.status) !== 'completed'),
    [assignments]
  )

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!csrfToken || !createTitle.trim()) {
      return
    }

    setCreating(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = {
        title: createTitle.trim(),
      }
      if (createDueDate) {
        payload.due_at = new Date(createDueDate).toISOString()
      }
      if (selectedAssignee) {
        payload.assignee_user_ids = [selectedAssignee]
      }

      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/tasks`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(err?.message || 'Unable to create task.')
      }

      await load()
      setCreateTitle('')
      setCreateDueDate('')
      setSelectedAssignee('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create task.')
    } finally {
      setCreating(false)
    }
  }

  const completeAssignment = async (assignmentId: string) => {
    if (!csrfToken || completingAssignmentId) return

    setCompletingAssignmentId(assignmentId)
    setError(null)

    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/assignments/${encodeURIComponent(assignmentId)}/complete`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ completion_source: 'manual' }),
        }
      )

      if (!response.ok) {
        const err = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(err?.message || 'Unable to complete assignment.')
      }

      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete assignment.')
    } finally {
      setCompletingAssignmentId(null)
    }
  }

  if (loading) {
    return <DashboardHomeSkeleton />
  }

  if (error && tasks.length === 0 && assignments.length === 0) {
    return <ErrorNotice title="Unable to load tasks" message={error} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Assign guide work, track due dates, and close completion loops."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}/home`}
        backLabel="Back to home"
        badges={
          <>
            <Badge variant="info">Assignments</Badge>
            <Badge variant={myOpenAssignments.length > 0 ? 'warning' : 'success'}>
              {myOpenAssignments.length > 0 ? `${myOpenAssignments.length} open` : 'All clear'}
            </Badge>
          </>
        }
      />

      {error && <ErrorNotice title="Task action failed" message={error} />}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Team tasks" value={tasks.length} helper="Workspace-wide" />
        <MetricCard label="My assignments" value={assignments.length} helper="Assigned to me" />
        <MetricCard label="Open assignments" value={myOpenAssignments.length} helper="Need action" />
      </div>

      <SectionCard title="Create task" description="Assign one teammate now, then add more later.">
        <form className="grid gap-3 sm:grid-cols-4" onSubmit={handleCreateTask}>
          <div className="sm:col-span-2">
            <Label htmlFor="task-title" className="mb-1.5 block">Title</Label>
            <Input
              id="task-title"
              value={createTitle}
              onChange={(event) => setCreateTitle(event.target.value)}
              placeholder="Complete onboarding guide"
            />
          </div>
          <div>
            <Label htmlFor="task-due" className="mb-1.5 block">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={createDueDate}
              onChange={(event) => setCreateDueDate(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="task-assignee" className="mb-1.5 block">Assignee</Label>
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger id="task-assignee">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                {teammates.map((teammate) => (
                  <SelectItem key={teammate.user_id} value={teammate.user_id}>
                    {teammate.primary_label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-4">
            <Button type="submit" disabled={!csrfToken || creating || !createTitle.trim()}>
              <Plus className="size-4" />
              Create task
            </Button>
          </div>
        </form>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Assigned to me"
          description="Complete or acknowledge tasks from here."
          action={<Badge variant="neutral">{assignments.length}</Badge>}
        >
          {assignments.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No assignments yet.
            </div>
          )}
          <div className="space-y-2">
            {assignments.map((assignment) => {
              const derivedStatus = assignment.derived_status ?? assignment.status
              return (
                <div
                  key={assignment.assignment_id}
                  className="rounded-lg border border-border bg-card px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {assignment.task?.title ?? assignment.task_id}
                      </div>
                      <div className="text-xs text-muted-foreground">Due {formatDate(assignment.due_at)}</div>
                    </div>
                    <Badge variant={statusVariant(derivedStatus)}>{derivedStatus.replace('_', ' ')}</Badge>
                  </div>
                  {derivedStatus !== 'completed' && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!csrfToken || completingAssignmentId === assignment.assignment_id}
                        onClick={() => completeAssignment(assignment.assignment_id)}
                      >
                        Mark complete
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Team tasks"
          description="Track overall assignment progress by task."
          action={<Badge variant="neutral">{tasks.length}</Badge>}
        >
          {tasks.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No tasks in this workspace.
            </div>
          )}
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.task_id}
                className="rounded-lg border border-border bg-card px-3 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{task.title}</div>
                    <div className="text-xs text-muted-foreground">Due {formatDate(task.due_at)}</div>
                  </div>
                  <Badge variant={statusVariant(task.status)}>{task.status.replace('_', ' ')}</Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {(task.assignment_counts?.completed ?? 0)}/{task.assignment_counts?.total ?? 0} completed ·{' '}
                  {task.assignment_counts?.overdue ?? 0} overdue
                </div>
              </div>
            ))}
          </div>
          <div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/docs`}>Open documents</Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
