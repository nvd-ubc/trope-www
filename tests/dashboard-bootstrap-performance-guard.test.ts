import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = process.cwd()

type BootstrapClientExpectation = {
  clientPath: string
  bootstrapEndpointNeedle: string
}

const CLIENT_BOOTSTRAP_EXPECTATIONS: BootstrapClientExpectation[] = [
  {
    clientPath: 'app/(app)/dashboard/dashboard-client.tsx',
    bootstrapEndpointNeedle: '/api/dashboard/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/account/account-client.tsx',
    bootstrapEndpointNeedle: '/api/dashboard/account/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workspaces/[orgId]/workspace-overview-client.tsx',
    bootstrapEndpointNeedle: '/workspace-overview/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workspaces/[orgId]/workflows/workflows-client.tsx',
    bootstrapEndpointNeedle: '/workflows/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workspaces/[orgId]/runs/runs-client.tsx',
    bootstrapEndpointNeedle: '/runs/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workspaces/[orgId]/alerts/alerts-client.tsx',
    bootstrapEndpointNeedle: '/alerts/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workspaces/[orgId]/audit/audit-client.tsx',
    bootstrapEndpointNeedle: '/audit/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workspaces/[orgId]/compliance/compliance-client.tsx',
    bootstrapEndpointNeedle: '/compliance/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workspaces/[orgId]/members/members-client.tsx',
    bootstrapEndpointNeedle: '/members/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workspaces/[orgId]/settings/settings-client.tsx',
    bootstrapEndpointNeedle: '/settings/bootstrap',
  },
  {
    clientPath:
      'app/(app)/dashboard/workspaces/[orgId]/workflows/[workflowId]/workflow-detail-client.tsx',
    bootstrapEndpointNeedle: '/workflows/${encodeURIComponent(workflowId)}/bootstrap',
  },
  {
    clientPath: 'app/(app)/dashboard/workflows/[workflowId]/guide/guide-client.tsx',
    bootstrapEndpointNeedle: '/api/workflows/${encodeURIComponent(workflowId)}/guide/bootstrap',
  },
]

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

test('dashboard clients should keep bootstrap initial-load wiring', async () => {
  const missingBootstrapUsage: string[] = []

  for (const expectation of CLIENT_BOOTSTRAP_EXPECTATIONS) {
    const filePath = path.join(PROJECT_ROOT, expectation.clientPath)
    const source = await readFile(filePath, 'utf8')
    if (!source.includes(expectation.bootstrapEndpointNeedle)) {
      missingBootstrapUsage.push(
        `${expectation.clientPath} is missing bootstrap endpoint "${expectation.bootstrapEndpointNeedle}"`
      )
    }
  }

  assert.equal(
    missingBootstrapUsage.length,
    0,
    `Dashboard bootstrap wiring regressed:\n${missingBootstrapUsage.join('\n')}`
  )
})

test('bootstrap route handlers should remain present for dashboard initial loads', async () => {
  const missingRouteFiles: string[] = []

  for (const relativeFile of REQUIRED_BOOTSTRAP_ROUTE_FILES) {
    const filePath = path.join(PROJECT_ROOT, relativeFile)
    try {
      await access(filePath)
    } catch {
      missingRouteFiles.push(relativeFile)
    }
  }

  assert.equal(
    missingRouteFiles.length,
    0,
    `Expected bootstrap route handlers are missing:\n${missingRouteFiles.join('\n')}`
  )
})
