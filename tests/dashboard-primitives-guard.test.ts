import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = process.cwd()
const DASHBOARD_DIR = path.join(PROJECT_ROOT, 'app', '(app)', 'dashboard')
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx'])
const DISALLOWED_TAG_REGEX = /<(button|input|select|textarea)\b[^>]*>/g

async function collectDashboardFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectDashboardFiles(fullPath)))
      continue
    }
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function lineNumberForIndex(text: string, index: number): number {
  let line = 1
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1
  }
  return line
}

test('dashboard surfaces should use shadcn form/action primitives', async () => {
  const files = await collectDashboardFiles(DASHBOARD_DIR)
  const violations: string[] = []

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    DISALLOWED_TAG_REGEX.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = DISALLOWED_TAG_REGEX.exec(source)) !== null) {
      const tag = match[1]
      const fullTag = match[0]
      const line = lineNumberForIndex(source, match.index)

      // Hidden inputs for CSRF-like transport can be handled case-by-case if needed.
      if (
        tag === 'input' &&
        /type\s*=\s*["']hidden["']/i.test(fullTag)
      ) {
        continue
      }

      violations.push(
        `${path.relative(PROJECT_ROOT, file)}:${line} uses raw <${tag}> (${fullTag.trim()})`
      )
    }
  }

  assert.equal(
    violations.length,
    0,
    `Use shadcn primitives instead of raw form/action tags in dashboard clients.\n${violations.join('\n')}`
  )
})
