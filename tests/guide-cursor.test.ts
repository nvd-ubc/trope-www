import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_GUIDE_CURSOR_OVERLAY_MODE,
  parseGuideCursorOverlayMode,
  resolveGuideCursorOverlayMode,
} from '../src/lib/guide-cursor'

describe('guide cursor helpers', () => {
  it('parses known overlay modes', () => {
    assert.equal(parseGuideCursorOverlayMode('radar_dot'), 'radar_dot')
    assert.equal(parseGuideCursorOverlayMode('captured_cursor'), 'captured_cursor')
    assert.equal(parseGuideCursorOverlayMode('NONE'), 'none')
  })

  it('returns null for unknown overlay modes', () => {
    assert.equal(parseGuideCursorOverlayMode('sparkle'), null)
    assert.equal(parseGuideCursorOverlayMode(''), null)
    assert.equal(parseGuideCursorOverlayMode(null), null)
  })

  it('resolves unknown values to radar-dot default', () => {
    assert.equal(resolveGuideCursorOverlayMode('sparkle'), DEFAULT_GUIDE_CURSOR_OVERLAY_MODE)
    assert.equal(resolveGuideCursorOverlayMode(undefined), DEFAULT_GUIDE_CURSOR_OVERLAY_MODE)
  })
})
