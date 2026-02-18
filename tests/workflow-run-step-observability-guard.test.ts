import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('run step detail hook keeps endpoint and lazy-loading wiring', async () => {
  const source = await readFile(
    new URL('../src/lib/client/use-run-step-details.ts', import.meta.url),
    'utf8'
  )

  assert.match(
    source,
    /\/runs\/\$\{encodeURIComponent\(key\.runId\)\}\/steps/,
    'run step detail hook should fetch run step details by key.runId'
  )
  assert.match(
    source,
    /\/workflows\/\$\{encodeURIComponent\(\s*key\.workflowId\s*\)\}\//,
    'run step detail hook should scope requests by key.workflowId'
  )
  assert.match(
    source,
    /if \(runStepDetails\[key\.runId\] \|\| runStepLoading\[key\.runId\]\) return/,
    'run step detail hook should keep lazy-load dedupe guard'
  )
})

test('workflow detail client keeps lazy step detail UI wiring', async () => {
  const source = await readFile(
    new URL(
      '../app/(app)/dashboard/workspaces/[orgId]/workflows/[workflowId]/workflow-detail-client.tsx',
      import.meta.url
    ),
    'utf8'
  )

  assert.match(
    source,
    /View details/,
    'workflow detail client should expose run detail expansion affordance'
  )
  assert.match(
    source,
    /from ['"]@\/components\/workflow-run-step-details['"]/,
    'workflow detail client should use the shared run step details renderer'
  )
  assert.match(
    source,
    /from ['"]@\/lib\/client\/use-run-step-details['"]/,
    'workflow detail client should use shared run step details hook'
  )
})

test('runs client keeps lazy cross-workflow step detail UI wiring', async () => {
  const source = await readFile(
    new URL('../app/(app)/dashboard/workspaces/[orgId]/runs/runs-client.tsx', import.meta.url),
    'utf8'
  )

  assert.match(
    source,
    /View details/,
    'runs client should expose run detail expansion affordance'
  )
  assert.match(
    source,
    /from ['"]@\/components\/workflow-run-step-details['"]/,
    'runs client should use the shared run step details renderer'
  )
  assert.match(
    source,
    /from ['"]@\/lib\/client\/use-run-step-details['"]/,
    'runs client should use shared run step details hook'
  )
})

test('run step route proxies to backend step metrics endpoint', async () => {
  const source = await readFile(
    new URL(
      '../app/api/orgs/[orgId]/workflows/[workflowId]/runs/[runId]/steps/route.ts',
      import.meta.url
    ),
    'utf8'
  )

  assert.match(
    source,
    /\/v1\/orgs\/\$\{encodeURIComponent\(orgId\)\}\/workflows\/\$\{encodeURIComponent\(\s*workflowId\s*\)\}\/runs\/\$\{encodeURIComponent\(runId\)\}\/steps/,
    'run step API route should proxy to backend runs/{runId}/steps endpoint'
  )
})
