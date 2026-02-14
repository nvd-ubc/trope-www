import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PROJECT_ROOT = process.cwd()

test('header seeds auth link with a server-derived initial auth state', async () => {
  const headerSource = await readFile(
    path.join(PROJECT_ROOT, 'src/components/ui/header.tsx'),
    'utf8'
  )

  assert.match(
    headerSource,
    /readAuthSession/,
    'Header should derive auth state from the server session.'
  )
  assert.match(
    headerSource,
    /initialAuthState=/,
    'Header should pass initialAuthState into auth-aware navigation components.'
  )
  assert.match(
    headerSource,
    /<MobileMenu initialAuthState=\{initialAuthState\} \/>/,
    'Mobile menu should receive the same initial auth state hint.'
  )
})

test('header auth link is driven solely by initial auth state', async () => {
  const authLinkSource = await readFile(
    path.join(PROJECT_ROOT, 'src/components/ui/header-auth-link.tsx'),
    'utf8'
  )

  assert.match(
    authLinkSource,
    /initialAuthState: AuthState/,
    'AuthLink should require an initial auth state prop.'
  )
  assert.equal(
    authLinkSource.includes('/api/me'),
    false,
    'AuthLink should not issue runtime auth fetches.'
  )
})
