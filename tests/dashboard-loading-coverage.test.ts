import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = process.cwd()

const REQUIRED_LOADING_FILES = [
  'app/(app)/dashboard/loading.tsx',
  'app/(app)/dashboard/account/loading.tsx',
  'app/(app)/dashboard/workspaces/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/alerts/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/audit/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/compliance/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/invites/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/members/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/runs/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/settings/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/workflows/loading.tsx',
  'app/(app)/dashboard/workspaces/[orgId]/workflows/[workflowId]/loading.tsx',
  'app/(app)/dashboard/workflows/[workflowId]/guide/loading.tsx',
]

test('dashboard routes should provide loading.tsx skeleton coverage', async () => {
  const missing: string[] = []

  for (const relativeFile of REQUIRED_LOADING_FILES) {
    const filePath = path.join(PROJECT_ROOT, relativeFile)
    try {
      await access(filePath)
    } catch {
      missing.push(relativeFile)
      continue
    }

    const source = await readFile(filePath, 'utf8')
    const usesSkeletonComponent = source.includes('Skeleton')
    assert.equal(
      usesSkeletonComponent,
      true,
      `${relativeFile} should render structured skeleton UI components.`
    )
  }

  assert.equal(
    missing.length,
    0,
    `Dashboard loading coverage regressed. Missing loading entry files:\n${missing.join('\n')}`
  )
})
