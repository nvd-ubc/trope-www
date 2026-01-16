import { afterEach, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'

import * as authModule from '../src/lib/server/auth-config.ts'

const originalEnv = { ...process.env }

const restoreEnv = () => {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) {
      delete process.env[key]
    }
  }
  for (const [key, value] of Object.entries(originalEnv)) {
    process.env[key] = value
  }
}

beforeEach(() => {
  restoreEnv()
  process.env.NODE_ENV = 'test'
  const api = authModule.default ?? authModule
  api.__resetAuthConfigForTests?.()
})

afterEach(() => {
  const api = authModule.default ?? authModule
  api.__resetAuthConfigForTests?.()
  restoreEnv()
})

describe('getAuthConfig', () => {
  it('prefers explicit environment variables', () => {
    process.env.TROPE_STAGE = 'dev'
    process.env.TROPE_API_URL = 'https://api.example.com'
    process.env.TROPE_COGNITO_REGION = 'us-east-1'
    process.env.TROPE_COGNITO_WEB_CLIENT_ID = 'web-123'
    process.env.TROPE_COGNITO_DESKTOP_CLIENT_ID = 'desktop-456'

    const api = authModule.default ?? authModule
    const config = api.getAuthConfig()

    assert.equal(config.stage, 'dev')
    assert.equal(config.isProd, false)
    assert.equal(config.apiBaseUrl, 'https://api.example.com')
    assert.equal(config.region, 'us-east-1')
    assert.equal(config.webClientId, 'web-123')
    assert.equal(config.desktopClientId, 'desktop-456')
  })

  it('uses CloudFormation outputs when provided', () => {
    process.env.TROPE_STAGE = 'dev'
    process.env.TROPE_CLOUD_DEFAULTS_JSON = JSON.stringify({
      Stacks: [
        {
          Outputs: [
            { OutputKey: 'HttpApiUrl', OutputValue: 'https://api.dev.example' },
            { OutputKey: 'UserPoolWebClientId', OutputValue: 'web-abc' },
            { OutputKey: 'UserPoolDesktopClientId', OutputValue: 'desktop-xyz' },
          ],
        },
      ],
    })

    const api = authModule.default ?? authModule
    const config = api.getAuthConfig()

    assert.equal(config.apiBaseUrl, 'https://api.dev.example')
    assert.equal(config.region, 'us-west-2')
    assert.equal(config.webClientId, 'web-abc')
    assert.equal(config.desktopClientId, 'desktop-xyz')
  })

  it('falls back to stage defaults when no env is set', () => {
    process.env.TROPE_STAGE = 'dev'

    const api = authModule.default ?? authModule
    const config = api.getAuthConfig()

    assert.equal(config.apiBaseUrl, 'https://y9o3ly11z3.execute-api.us-west-2.amazonaws.com')
    assert.equal(config.webClientId, '4jp14fc9huc5mnq7uu4seg84ok')
    assert.equal(config.desktopClientId, '185pu34bemq1tp5lagdgpddt07')
    assert.equal(config.region, 'us-west-2')
  })

  it('defaults desktop client to the web client when only web client is set', () => {
    process.env.TROPE_STAGE = 'dev'
    process.env.TROPE_API_URL = 'https://api.custom.example'
    process.env.TROPE_COGNITO_REGION = 'us-east-1'
    process.env.TROPE_COGNITO_WEB_CLIENT_ID = 'web-custom-123'

    const api = authModule.default ?? authModule
    const config = api.getAuthConfig()

    assert.equal(config.webClientId, 'web-custom-123')
    assert.equal(config.desktopClientId, 'web-custom-123')
  })

  it('ignores AWS_REGION when resolving Cognito region', () => {
    process.env.TROPE_STAGE = 'dev'
    process.env.AWS_REGION = 'us-east-1'

    const api = authModule.default ?? authModule
    const config = api.getAuthConfig()

    assert.equal(config.region, 'us-west-2')
  })
})
