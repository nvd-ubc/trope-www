'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  normalizeStepMetricsPayload,
  type RunStepMetricsResponse,
  type WorkflowRunStepMetricsPayload,
} from '@/lib/workflow-run-step-metrics'

type RunStepKey = {
  runId: string
  workflowId: string
}

type UseRunStepDetailsParams = {
  orgId: string
  onUnauthorized: () => void
}

type UseRunStepDetailsResult = {
  expandedRunIds: string[]
  expandedRunIdSet: Set<string>
  runStepDetails: Record<string, WorkflowRunStepMetricsPayload>
  runStepLoading: Record<string, boolean>
  runStepErrors: Record<string, string | null>
  runStepRequestIds: Record<string, string | null>
  setVisibleRunIds: (runIds: string[]) => void
  loadRunStepDetails: (key: RunStepKey) => Promise<void>
  toggleRunDetails: (key: RunStepKey) => Promise<void>
}

export const useRunStepDetails = (params: UseRunStepDetailsParams): UseRunStepDetailsResult => {
  const { orgId, onUnauthorized } = params
  const [expandedRunIds, setExpandedRunIds] = useState<string[]>([])
  const [runStepDetails, setRunStepDetails] = useState<Record<string, WorkflowRunStepMetricsPayload>>(
    {}
  )
  const [runStepLoading, setRunStepLoading] = useState<Record<string, boolean>>({})
  const [runStepErrors, setRunStepErrors] = useState<Record<string, string | null>>({})
  const [runStepRequestIds, setRunStepRequestIds] = useState<Record<string, string | null>>({})

  const setVisibleRunIds = useCallback((runIds: string[]) => {
    const runIdSet = new Set(runIds)
    setExpandedRunIds((prev) => prev.filter((runId) => runIdSet.has(runId)))
  }, [])

  const loadRunStepDetails = useCallback(async (key: RunStepKey) => {
    setRunStepLoading((prev) => ({ ...prev, [key.runId]: true }))
    setRunStepErrors((prev) => ({ ...prev, [key.runId]: null }))
    setRunStepRequestIds((prev) => ({ ...prev, [key.runId]: null }))

    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
          key.workflowId
        )}/runs/${encodeURIComponent(key.runId)}/steps`,
        { cache: 'no-store' }
      )
      if (response.status === 401) {
        onUnauthorized()
        return
      }

      const payload = (await response.json().catch(() => null)) as RunStepMetricsResponse | null
      if (!response.ok || !payload) {
        setRunStepRequestIds((prev) => ({
          ...prev,
          [key.runId]: response.headers.get('x-trope-request-id'),
        }))
        throw new Error(payload?.message || payload?.error || 'Unable to load run step detail.')
      }

      setRunStepDetails((prev) => ({
        ...prev,
        [key.runId]: normalizeStepMetricsPayload(payload.step_metrics),
      }))
    } catch (err) {
      setRunStepErrors((prev) => ({
        ...prev,
        [key.runId]: err instanceof Error ? err.message : 'Unable to load run step detail.',
      }))
    } finally {
      setRunStepLoading((prev) => ({ ...prev, [key.runId]: false }))
    }
  }, [onUnauthorized, orgId])

  const toggleRunDetails = useCallback(async (key: RunStepKey) => {
    const isExpanded = expandedRunIds.includes(key.runId)
    if (isExpanded) {
      setExpandedRunIds((prev) => prev.filter((value) => value !== key.runId))
      return
    }

    setExpandedRunIds((prev) => (prev.includes(key.runId) ? prev : [...prev, key.runId]))
    if (runStepDetails[key.runId] || runStepLoading[key.runId]) return
    await loadRunStepDetails(key)
  }, [expandedRunIds, loadRunStepDetails, runStepDetails, runStepLoading])

  const expandedRunIdSet = useMemo(() => new Set(expandedRunIds), [expandedRunIds])

  return {
    expandedRunIds,
    expandedRunIdSet,
    runStepDetails,
    runStepLoading,
    runStepErrors,
    runStepRequestIds,
    setVisibleRunIds,
    loadRunStepDetails,
    toggleRunDetails,
  }
}
