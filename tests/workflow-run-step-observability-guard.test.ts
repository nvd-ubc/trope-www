import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('workflow detail client keeps lazy step detail fetch wiring', async () => {
  const source = await readFile(
    new URL(
      '../app/(app)/dashboard/workspaces/[orgId]/workflows/[workflowId]/workflow-detail-client.tsx',
      import.meta.url
    ),
    'utf8'
  )

  assert.match(
    source,
    /\/runs\/\$\{encodeURIComponent\(runId\)\}\/steps/,
    'workflow detail client should fetch run step details by runId'
  )
  assert.match(
    source,
    /View details/,
    'workflow detail client should expose run detail expansion affordance'
  )
})

test('runs client keeps lazy cross-workflow step detail fetch wiring', async () => {
  const source = await readFile(
    new URL('../app/(app)/dashboard/workspaces/[orgId]/runs/runs-client.tsx', import.meta.url),
    'utf8'
  )

  assert.match(
    source,
    /\/runs\/\$\{encodeURIComponent\(run\.run_id\)\}\/steps/,
    'runs client should fetch run step details using run.run_id'
  )
  assert.match(
    source,
    /View details/,
    'runs client should expose run detail expansion affordance'
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
