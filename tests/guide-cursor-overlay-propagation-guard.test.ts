import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = process.cwd()

const readSource = async (relativePath: string) =>
  readFile(path.join(PROJECT_ROOT, relativePath), 'utf8')

test('guide editor should persist cursor overlay mode through save and publish', async () => {
  const guideClientPath = 'app/(app)/dashboard/workflows/[workflowId]/guide/guide-client.tsx'
  const source = await readSource(guideClientPath)

  assert.equal(
    source.includes('cursor_overlay_mode?: GuideCursorOverlayMode | string | null'),
    true,
    `${guideClientPath} should keep cursor_overlay_mode in GuideSpec typing.`
  )
  assert.equal(
    source.includes('const normalizedSpec = normalizeSpecForPublish(draftSpec, workflow?.title ?? workflowId)'),
    true,
    `${guideClientPath} should normalize draft specs before publishing.`
  )
  assert.equal(
    source.includes('body: JSON.stringify(normalizedSpec)'),
    true,
    `${guideClientPath} should upload normalized spec JSON containing cursor_overlay_mode.`
  )
  assert.equal(
    source.includes('<SelectItem value="captured_cursor">'),
    true,
    `${guideClientPath} should expose the captured_cursor mode in-product.`
  )
})

test('workflow detail and share pages should consume saved cursor overlay mode', async () => {
  const consumers = [
    'app/(app)/dashboard/workspaces/[orgId]/workflows/[workflowId]/workflow-detail-client.tsx',
    'app/(share)/share/[shareId]/share-client.tsx',
  ]

  for (const relativePath of consumers) {
    const source = await readSource(relativePath)
    assert.equal(
      source.includes('cursor_overlay_mode?: string | null'),
      true,
      `${relativePath} should include cursor_overlay_mode in GuideSpec typing.`
    )
    assert.equal(
      source.includes('const cursorOverlayMode = resolveGuideCursorOverlayMode(spec?.cursor_overlay_mode)'),
      true,
      `${relativePath} should resolve cursor_overlay_mode from the loaded spec.`
    )
    assert.equal(
      source.includes('cursorOverlayMode={cursorOverlayMode}'),
      true,
      `${relativePath} should pass cursorOverlayMode into guide step rendering.`
    )
  }
})
