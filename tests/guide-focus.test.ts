import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { computeFocusTransformV1 } from '../src/lib/guide-focus'

type FixtureCase = {
  name: string
  input: {
    image: { width: number; height: number }
    viewport: { width: number; height: number }
    render_hints?: Record<string, unknown> | null
    radar?: Record<string, unknown> | null
  }
  expected: {
    crop_rect: { x: number; y: number; width: number; height: number }
    zoom_scale: number
    radar_percent: { left: number; top: number } | null
    has_focus_crop: boolean
  }
}

const fixturePayload = JSON.parse(
  readFileSync(new URL('./fixtures/guide-focus-transform-v1.json', import.meta.url), 'utf8')
) as { cases: FixtureCase[] }

const almostEqual = (actual: number, expected: number, epsilon = 0.0005) =>
  Math.abs(actual - expected) <= epsilon

describe('guide focus transform v1 fixtures', () => {
  for (const fixture of fixturePayload.cases) {
    it(fixture.name, () => {
      const result = computeFocusTransformV1({
        image: fixture.input.image,
        viewport: fixture.input.viewport,
        renderHints: fixture.input.render_hints as never,
        radar: fixture.input.radar as never,
      })

      assert.equal(result.cropRect.x, fixture.expected.crop_rect.x)
      assert.equal(result.cropRect.y, fixture.expected.crop_rect.y)
      assert.equal(result.cropRect.width, fixture.expected.crop_rect.width)
      assert.equal(result.cropRect.height, fixture.expected.crop_rect.height)
      assert.equal(result.hasFocusCrop, fixture.expected.has_focus_crop)
      assert.equal(almostEqual(result.zoomScale, fixture.expected.zoom_scale), true)

      if (fixture.expected.radar_percent === null) {
        assert.equal(result.radarPercentInCrop, null)
      } else {
        assert.ok(result.radarPercentInCrop)
        assert.equal(almostEqual(result.radarPercentInCrop.left, fixture.expected.radar_percent.left), true)
        assert.equal(almostEqual(result.radarPercentInCrop.top, fixture.expected.radar_percent.top), true)
      }
    })
  }
})
