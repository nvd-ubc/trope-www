'use client'

import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table'
import {
  formatMetricMap,
  formatTokenSummary,
  summarizeStepInsights,
  type WorkflowRunStepMetricsPayload,
} from '@/lib/workflow-run-step-metrics'

type WorkflowRunStepDetailsProps = {
  runId: string
  loading: boolean
  error?: string | null
  requestId?: string | null
  stepMetrics?: WorkflowRunStepMetricsPayload
  onRetry: () => void
  onCopyRequestId: (value: string) => void | Promise<void>
  formatDateTime: (value?: string | null) => string
  formatDuration: (ms?: number | null) => string
  resolveStepTitle?: (stepId: string, stepIndex: number) => string | null
}

export default function WorkflowRunStepDetails(props: WorkflowRunStepDetailsProps) {
  if (props.loading) {
    return <div className="text-xs text-muted-foreground">Loading step metrics…</div>
  }

  if (props.error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-3 text-xs text-destructive">
        <div>{props.error}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {props.requestId && (
            <>
              <span className="text-destructive/80">Request ID: {props.requestId}</span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => void props.onCopyRequestId(props.requestId as string)}
              >
                Copy
              </Button>
            </>
          )}
          <Button type="button" variant="outline" size="xs" onClick={props.onRetry}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!props.stepMetrics) {
    return <div className="text-xs text-muted-foreground">Step detail unavailable for this run.</div>
  }

  const sortedSteps = [...(props.stepMetrics.steps ?? [])].sort((left, right) => {
    if (left.step_index !== right.step_index) {
      return left.step_index - right.step_index
    }
    return left.step_id.localeCompare(right.step_id)
  })
  const stepInsights = summarizeStepInsights(sortedSteps, props.formatDuration)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="neutral">Step metrics {props.stepMetrics.version || 'v2'}</Badge>
        <span>Run tokens: {formatTokenSummary(props.stepMetrics.totals)}</span>
        <span>Steps captured: {sortedSteps.length}</span>
      </div>
      {stepInsights.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {stepInsights.map((insight) => (
            <Badge key={`${props.runId}:${insight}`} variant="outline">
              {insight}
            </Badge>
          ))}
        </div>
      )}
      {sortedSteps.length === 0 ? (
        <div className="text-xs text-muted-foreground">No step-level metrics captured for this run.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[1080px]">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Step</TableHeaderCell>
                <TableHeaderCell>Timing</TableHeaderCell>
                <TableHeaderCell>Completion</TableHeaderCell>
                <TableHeaderCell>Guidance</TableHeaderCell>
                <TableHeaderCell>Alignment</TableHeaderCell>
                <TableHeaderCell>Highlight</TableHeaderCell>
                <TableHeaderCell>Tokens</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSteps.map((step) => {
                const stepTitle = props.resolveStepTitle?.(step.step_id, step.step_index)
                return (
                  <TableRow key={`${props.runId}:${step.step_index}:${step.step_id}`}>
                    <TableCell className="whitespace-normal">
                      <div className="font-medium text-foreground">#{step.step_index + 1}</div>
                      {stepTitle && <div className="text-xs text-foreground/80">{stepTitle}</div>}
                      <div className="font-mono text-xs text-muted-foreground">{step.step_id}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-normal">
                      <div>Started: {props.formatDateTime(step.started_at)}</div>
                      <div>Completed: {props.formatDateTime(step.completed_at ?? null)}</div>
                      <div>Duration: {props.formatDuration(step.duration_ms)}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-normal">
                      <div>Method: {step.completion_method ?? '-'}</div>
                      <div>Reason: {step.completion_reason_code ?? '-'}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-normal">
                      <div>
                        Req/Res/No: {step.guidance?.requests ?? 0}/{step.guidance?.results ?? 0}/
                        {step.guidance?.no_result ?? 0}
                      </div>
                      <div>Latency: {formatMetricMap(step.guidance?.latency_ms_buckets)}</div>
                      <div>Reasons: {formatMetricMap(step.guidance?.reason_counts)}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-normal">
                      <div>
                        Req/Res: {step.alignment?.requests ?? 0}/{step.alignment?.results ?? 0}
                      </div>
                      <div>Latency: {formatMetricMap(step.alignment?.latency_ms_buckets)}</div>
                      <div>Reasons: {formatMetricMap(step.alignment?.reason_counts)}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-normal">
                      <div>
                        Shown/Hit/Miss: {step.highlight?.shown ?? 0}/{step.highlight?.click_hit ?? 0}/
                        {step.highlight?.click_miss ?? 0}
                      </div>
                      <div>Distance: {formatMetricMap(step.highlight?.distance_buckets)}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-normal">
                      {formatTokenSummary(step.tokens)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
