import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  hasRequiredProfileNames,
  parseProfileNameFields,
  safeInternalPath,
} from '../src/lib/profile-identity'

describe('profile identity integration helpers', () => {
  it('parses first/last names from explicit inputs', () => {
    const parsed = parseProfileNameFields({
      firstNameInput: '  Jane ',
      lastNameInput: ' Doe  ',
      legacyFullName: 'Ignored Legacy',
    })

    assert.equal(parsed.firstName, 'Jane')
    assert.equal(parsed.lastName, 'Doe')
    assert.equal(parsed.displayName, 'Jane Doe')
  })

  it('falls back to legacy full_name when first/last are missing', () => {
    const parsed = parseProfileNameFields({
      firstNameInput: '',
      lastNameInput: '',
      legacyFullName: '  Victor Vannara ',
    })

    assert.equal(parsed.firstName, 'Victor')
    assert.equal(parsed.lastName, 'Vannara')
    assert.equal(parsed.displayName, 'Victor Vannara')
  })

  it('requires both profile names for completion gate', () => {
    assert.equal(hasRequiredProfileNames({ first_name: 'Jane', last_name: 'Doe' }), true)
    assert.equal(hasRequiredProfileNames({ first_name: 'Jane', last_name: null }), false)
    assert.equal(hasRequiredProfileNames({ first_name: ' ', last_name: 'Doe' }), false)
  })

  it('allows only internal app paths for redirect targets', () => {
    assert.equal(safeInternalPath('/dashboard/workspaces?query=a'), '/dashboard/workspaces?query=a')
    assert.equal(safeInternalPath('https://example.com/evil'), null)
    assert.equal(safeInternalPath('//evil.example'), null)
    assert.equal(safeInternalPath(''), null)
  })
})
