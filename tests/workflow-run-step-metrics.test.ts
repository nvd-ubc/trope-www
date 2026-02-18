import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  formatMetricMap,
  formatTokenSummary,
  normalizeStepMetricsPayload,
  summarizeStepInsights,
  type WorkflowRunStepMetrics,
} from '../src/lib/workflow-run-step-metrics'

describe('workflow run step metrics helpers', () => {
  it('normalizes missing payload values to v2 defaults', () => {
    assert.deepEqual(normalizeStepMetricsPayload(undefined), {
      version: 'v2',
      steps: [],
      totals: undefined,
    })
  })

  it('normalizes payload with trimmed version and steps list', () => {
    const payload = normalizeStepMetricsPayload({
      version: '  v2  ',
      steps: [
        {
          step_id: 'step-a',
          step_index: 0,
          started_at: '2026-02-18T00:00:00.000Z',
        },
      ],
      totals: { prompt_tokens: 12, completion_tokens: 4, credits: 1 },
    })

    assert.equal(payload.version, 'v2')
    assert.equal(payload.steps.length, 1)
    assert.deepEqual(payload.totals, { prompt_tokens: 12, completion_tokens: 4, credits: 1 })
  })

  it('formats metric maps by filtering invalid counts and sorting descending', () => {
    assert.equal(
      formatMetricMap({
        low: 2,
        high: 8,
        zero: 0,
        negative: -4,
        nan: Number.NaN,
      }),
      'high:8, low:2'
    )
    assert.equal(formatMetricMap(undefined), '-')
  })

  it('formats token summaries with prompt/completion/credits values', () => {
    assert.equal(formatTokenSummary(undefined), '-')
    assert.equal(formatTokenSummary({ prompt_tokens: 0, completion_tokens: 0, credits: 0 }), '-')
    assert.equal(
      formatTokenSummary({ prompt_tokens: 50, completion_tokens: 10, credits: 2 }),
      'P 50 · C 10 · Cr 2'
    )
  })

  it('derives step insights for slowest/no-result/token-heavy steps', () => {
    const steps: WorkflowRunStepMetrics[] = [
      {
        step_id: 'step-a',
        step_index: 0,
        started_at: '2026-02-18T00:00:00.000Z',
        duration_ms: 1500,
        guidance: { no_result: 1 },
        tokens: { prompt_tokens: 120, completion_tokens: 25, credits: 1 },
      },
      {
        step_id: 'step-b',
        step_index: 1,
        started_at: '2026-02-18T00:01:00.000Z',
        duration_ms: 8400,
        guidance: { no_result: 0 },
        tokens: { prompt_tokens: 5, completion_tokens: 3, credits: 0 },
      },
      {
        step_id: 'step-c',
        step_index: 2,
        started_at: '2026-02-18T00:02:00.000Z',
        duration_ms: 4200,
        guidance: { no_result: 5 },
      },
    ]

    const insights = summarizeStepInsights(steps, (ms) => `${ms ?? 0}ms`)
    assert.deepEqual(insights, [
      'Slowest: #2 (8400ms)',
      'No-result hotspot: #3 (5)',
      'Token-heavy: #1 (P 120 · C 25 · Cr 1)',
    ])
  })

  it('returns empty step insights when data is absent', () => {
    const steps: WorkflowRunStepMetrics[] = [
      {
        step_id: 'step-a',
        step_index: 0,
        started_at: '2026-02-18T00:00:00.000Z',
      },
    ]

    assert.deepEqual(summarizeStepInsights(steps, () => '-'), [])
  })
})
