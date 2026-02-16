import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = process.cwd()

const readSource = async (relativePath: string) =>
  readFile(path.join(PROJECT_ROOT, relativePath), 'utf8')

const assertMatches = (source: string, pattern: RegExp, message: string) => {
  assert.equal(pattern.test(source), true, message)
}

test('guide editor should persist cursor overlay mode through save and publish', async () => {
  const guideClientPath = 'app/(app)/dashboard/workflows/[workflowId]/guide/guide-client.tsx'
  const source = await readSource(guideClientPath)

  assertMatches(
    source,
    /cursor_overlay_mode\?\s*:\s*GuideCursorOverlayMode\s*\|\s*string\s*\|\s*null/,
    `${guideClientPath} should keep cursor_overlay_mode in GuideSpec typing.`
  )
  assertMatches(
    source,
    /const\s+normalizedSpec\s*=\s*normalizeSpecForPublish\(\s*draftSpec\s*,\s*workflow\?\.title\s*\?\?\s*workflowId\s*\)/,
    `${guideClientPath} should normalize draft specs before publishing.`
  )
  assertMatches(
    source,
    /body:\s*JSON\.stringify\(\s*normalizedSpec\s*\)/,
    `${guideClientPath} should upload normalized spec JSON containing cursor_overlay_mode.`
  )
  assertMatches(
    source,
    /<SelectItem\s+value="captured_cursor">/,
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
    assertMatches(
      source,
      /cursor_overlay_mode\?\s*:\s*string\s*\|\s*null/,
      `${relativePath} should include cursor_overlay_mode in GuideSpec typing.`
    )
    assertMatches(
      source,
      /const\s+cursorOverlayMode\s*=\s*resolveGuideCursorOverlayMode\(\s*spec\?\.cursor_overlay_mode\s*\)/,
      `${relativePath} should resolve cursor_overlay_mode from the loaded spec.`
    )
    assertMatches(
      source,
      /cursorOverlayMode=\{\s*cursorOverlayMode\s*\}/,
      `${relativePath} should pass cursorOverlayMode into guide step rendering.`
    )
  }
})
