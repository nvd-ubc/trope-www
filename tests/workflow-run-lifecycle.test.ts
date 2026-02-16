import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  aggregateRunLifecycle,
  computeDurationPercentileMs,
  summarizeRunLifecycle,
} from '../src/lib/workflow-run-lifecycle'

describe('workflow run lifecycle helpers', () => {
  it('summarizes attempted/completed counts from workflow windows', () => {
    const summary = summarizeRunLifecycle(
      { total: 9, success: 6, failed: 2, canceled: 1 },
      { guided_starts: 12, guided_completions: 6 }
    )

    assert.deepEqual(summary, {
      attempted: 12,
      completed: 9,
      success: 6,
      failed: 2,
      canceled: 1,
      completionRate: 0.75,
    })
  })

  it('returns zeroed lifecycle values when metrics are missing', () => {
    const summary = summarizeRunLifecycle(null, null)

    assert.deepEqual(summary, {
      attempted: 0,
      completed: 0,
      success: 0,
      failed: 0,
      canceled: 0,
      completionRate: null,
    })
  })

  it('aggregates lifecycle stats across workflows', () => {
    const summary = aggregateRunLifecycle([
      {
        run_stats_7d: { total: 8, success: 5, failed: 2, canceled: 1 },
        metrics_7d: { guided_starts: 10, guided_completions: 5 },
      },
      {
        run_stats_7d: { total: 5, success: 4, failed: 0, canceled: 1 },
        metrics_7d: { guided_starts: 7, guided_completions: 4 },
      },
    ])

    assert.deepEqual(summary, {
      attempted: 17,
      completed: 13,
      success: 9,
      failed: 2,
      canceled: 2,
      completionRate: 13 / 17,
    })
  })

  it('computes duration percentile using nearest-rank semantics', () => {
    const runs = [
      { duration_ms: 1000 },
      { duration_ms: 2000 },
      { duration_ms: 3000 },
      { duration_ms: 4000 },
      { duration_ms: 5000 },
    ]

    assert.equal(computeDurationPercentileMs(runs, 0.5), 3000)
    assert.equal(computeDurationPercentileMs(runs, 0.95), 5000)
  })

  it('ignores invalid durations and returns null when no valid sample exists', () => {
    const runs = [
      { duration_ms: null },
      { duration_ms: undefined },
      { duration_ms: -20 },
      { duration_ms: 0 },
      { duration_ms: Number.NaN },
    ]

    assert.equal(computeDurationPercentileMs(runs, 0.95), null)
  })
})
