export type WorkflowRunStepTokenTotals = {
  prompt_tokens?: number
  completion_tokens?: number
  credits?: number
}

export type WorkflowRunStepGuidanceMetrics = {
  requests?: number
  results?: number
  no_result?: number
  latency_ms_buckets?: Record<string, number>
  reason_counts?: Record<string, number>
}

export type WorkflowRunStepAlignmentMetrics = {
  requests?: number
  results?: number
  latency_ms_buckets?: Record<string, number>
  reason_counts?: Record<string, number>
}

export type WorkflowRunStepHighlightMetrics = {
  shown?: number
  click_hit?: number
  click_miss?: number
  distance_buckets?: Record<string, number>
}

export type WorkflowRunStepMetrics = {
  step_id: string
  step_index: number
  started_at: string
  completed_at?: string
  duration_ms?: number
  completion_method?: 'auto' | 'manual'
  completion_reason_code?: string
  guidance?: WorkflowRunStepGuidanceMetrics
  alignment?: WorkflowRunStepAlignmentMetrics
  highlight?: WorkflowRunStepHighlightMetrics
  tokens?: WorkflowRunStepTokenTotals
}

export type WorkflowRunStepMetricsPayload = {
  version: string
  steps: WorkflowRunStepMetrics[]
  totals?: WorkflowRunStepTokenTotals
}

export type RunStepMetricsResponse = {
  run_id: string
  step_metrics?: WorkflowRunStepMetricsPayload | null
  error?: string
  message?: string
}

export const normalizeStepMetricsPayload = (
  value?: WorkflowRunStepMetricsPayload | null
): WorkflowRunStepMetricsPayload => ({
  version: value?.version?.trim() || 'v2',
  steps: Array.isArray(value?.steps) ? value.steps : [],
  totals: value?.totals,
})

export const formatMetricMap = (value?: Record<string, number>) => {
  const entries = Object.entries(value ?? {})
    .filter(([, count]) => Number.isFinite(count) && count > 0)
    .sort((left, right) => right[1] - left[1])
  if (entries.length === 0) return '-'
  return entries.map(([key, count]) => `${key}:${count}`).join(', ')
}

export const formatTokenSummary = (tokens?: WorkflowRunStepTokenTotals) => {
  const prompt = tokens?.prompt_tokens ?? 0
  const completion = tokens?.completion_tokens ?? 0
  const credits = tokens?.credits ?? 0
  if (prompt <= 0 && completion <= 0 && credits <= 0) return '-'
  return `P ${prompt} · C ${completion} · Cr ${credits}`
}

export const summarizeStepInsights = (
  steps: WorkflowRunStepMetrics[],
  formatDuration: (ms?: number | null) => string
) => {
  const insights: string[] = []
  const slowest = [...steps]
    .filter((step) => (step.duration_ms ?? 0) > 0)
    .sort((left, right) => (right.duration_ms ?? 0) - (left.duration_ms ?? 0))[0]
  if (slowest) {
    insights.push(`Slowest: #${slowest.step_index + 1} (${formatDuration(slowest.duration_ms)})`)
  }

  const noResultHotspot = [...steps]
    .filter((step) => (step.guidance?.no_result ?? 0) > 0)
    .sort((left, right) => (right.guidance?.no_result ?? 0) - (left.guidance?.no_result ?? 0))[0]
  if (noResultHotspot) {
    insights.push(
      `No-result hotspot: #${noResultHotspot.step_index + 1} (${noResultHotspot.guidance?.no_result ?? 0})`
    )
  }

  const tokenHeavy = [...steps]
    .filter((step) => (step.tokens?.prompt_tokens ?? 0) + (step.tokens?.completion_tokens ?? 0) > 0)
    .sort((left, right) => {
      const leftTotal = (left.tokens?.prompt_tokens ?? 0) + (left.tokens?.completion_tokens ?? 0)
      const rightTotal = (right.tokens?.prompt_tokens ?? 0) + (right.tokens?.completion_tokens ?? 0)
      return rightTotal - leftTotal
    })[0]
  if (tokenHeavy) {
    insights.push(`Token-heavy: #${tokenHeavy.step_index + 1} (${formatTokenSummary(tokenHeavy.tokens)})`)
  }

  return insights
}
