import assert from 'node:assert/strict'
import test from 'node:test'
import { auditLinks } from '../scripts/audit-links'

test('internal links should resolve to known routes', async () => {
  const errors = await auditLinks()
  assert.equal(errors.length, 0, errors.join('\n'))
})
