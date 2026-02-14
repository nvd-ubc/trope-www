import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = process.cwd()

const REQUIRED_BOOTSTRAP_ROUTE_FILES = [
  'app/api/dashboard/bootstrap/route.ts',
  'app/api/dashboard/account/bootstrap/route.ts',
  'app/api/orgs/[orgId]/workspace-overview/bootstrap/route.ts',
  'app/api/orgs/[orgId]/runs/bootstrap/route.ts',
  'app/api/orgs/[orgId]/workflows/bootstrap/route.ts',
  'app/api/orgs/[orgId]/alerts/bootstrap/route.ts',
  'app/api/orgs/[orgId]/audit/bootstrap/route.ts',
  'app/api/orgs/[orgId]/compliance/bootstrap/route.ts',
  'app/api/orgs/[orgId]/members/bootstrap/route.ts',
  'app/api/orgs/[orgId]/settings/bootstrap/route.ts',
  'app/api/orgs/[orgId]/workflows/[workflowId]/bootstrap/route.ts',
  'app/api/workflows/[workflowId]/guide/bootstrap/route.ts',
]

test('bootstrap routes should preserve observability metadata wiring', async () => {
  const violations: string[] = []

  for (const relativePath of REQUIRED_BOOTSTRAP_ROUTE_FILES) {
    const filePath = path.join(PROJECT_ROOT, relativePath)
    const source = await readFile(filePath, 'utf8')
    const importsBootstrapHelpers = source.includes('applyBootstrapMeta')
    const appliesBootstrapMetadata = source.includes('applyBootstrapMeta(')

    if (!importsBootstrapHelpers || !appliesBootstrapMetadata) {
      violations.push(
        `${relativePath} must import and apply bootstrap metadata for traceability headers`
      )
    }
  }

  assert.equal(
    violations.length,
    0,
    `Bootstrap observability wiring regressed:\n${violations.join('\n')}`
  )
})
