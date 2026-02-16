import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = process.cwd()

test('home bootstrap treats notifications as best effort', async () => {
  const filePath = path.join(PROJECT_ROOT, 'app/api/orgs/[orgId]/home/bootstrap/route.ts')
  const source = await readFile(filePath, 'utf8')

  assert.equal(
    source.includes('firstFailedResult(homeResult)'),
    true,
    'Home bootstrap should only hard-fail on home payload failures.'
  )
  assert.equal(
    source.includes('firstFailedResult(homeResult, notificationsResult)'),
    false,
    'Home bootstrap should not fail closed on notifications subrequest failures.'
  )
  assert.equal(
    source.includes('notificationsResult.ok ? notificationsResult.data : { notifications: [] }'),
    true,
    'Home bootstrap should return an empty notifications payload when notifications fail.'
  )
})

test('home client does not block on notification settings failures', async () => {
  const filePath = path.join(
    PROJECT_ROOT,
    'app/(app)/dashboard/workspaces/[orgId]/home/home-client.tsx'
  )
  const source = await readFile(filePath, 'utf8')

  assert.equal(
    source.includes('response.status === 401 || settingsResponse.status === 401'),
    false,
    'Home should not redirect due to notification settings auth failures.'
  )
  assert.equal(
    source.includes('if (response.status === 401)'),
    true,
    'Home should still redirect on explicit bootstrap unauthorized responses.'
  )
})
