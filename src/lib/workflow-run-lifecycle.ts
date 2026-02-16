export type WorkflowRunStatsWindow = {
  total?: number | null
  success?: number | null
  failed?: number | null
  canceled?: number | null
} | null | undefined

export type WorkflowMetricsWindow = {
  guided_starts?: number | null
  guided_completions?: number | null
} | null | undefined

export type RunLifecycleSummary = {
  attempted: number
  completed: number
  success: number
  failed: number
  canceled: number
  completionRate: number | null
}

const toNonNegativeCount = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return 0
  }
  return Math.floor(value)
}

const toSafePercentile = (value: number): number => {
  if (!Number.isFinite(value)) return 0.95
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

const completionRate = (completed: number, attempted: number): number | null => {
  if (attempted <= 0) return null
  return completed / attempted
}

export const summarizeRunLifecycle = (
  runStats: WorkflowRunStatsWindow,
  metrics: WorkflowMetricsWindow
): RunLifecycleSummary => {
  const attempted = toNonNegativeCount(metrics?.guided_starts)
  const completed = toNonNegativeCount(runStats?.total)
  const success = toNonNegativeCount(runStats?.success)
  const failed = toNonNegativeCount(runStats?.failed)
  const canceled = toNonNegativeCount(runStats?.canceled)

  return {
    attempted,
    completed,
    success,
    failed,
    canceled,
    completionRate: completionRate(completed, attempted),
  }
}

export const aggregateRunLifecycle = (
  workflows: Array<{
    run_stats_7d?: WorkflowRunStatsWindow
    metrics_7d?: WorkflowMetricsWindow
  }>
): RunLifecycleSummary => {
  let attempted = 0
  let completed = 0
  let success = 0
  let failed = 0
  let canceled = 0

  for (const workflow of workflows) {
    const summary = summarizeRunLifecycle(workflow.run_stats_7d, workflow.metrics_7d)
    attempted += summary.attempted
    completed += summary.completed
    success += summary.success
    failed += summary.failed
    canceled += summary.canceled
  }

  return {
    attempted,
    completed,
    success,
    failed,
    canceled,
    completionRate: completionRate(completed, attempted),
  }
}

export const computeDurationPercentileMs = (
  runs: Array<{ duration_ms?: number | null }>,
  percentile: number
): number | null => {
  const samples = runs
    .map((run) => run.duration_ms)
    .filter((duration): duration is number => typeof duration === 'number' && Number.isFinite(duration) && duration > 0)
    .sort((a, b) => a - b)

  if (samples.length === 0) {
    return null
  }

  const p = toSafePercentile(percentile)
  const rank = Math.ceil(p * samples.length)
  const index = Math.min(Math.max(rank - 1, 0), samples.length - 1)
  return samples[index]
}
