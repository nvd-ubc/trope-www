import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { deriveGuideStepImagesWithFocus, readStepScreenshotOverridesV1 } from '../src/lib/guide-screenshot-focus'

describe('guide screenshot focus derivation', () => {
  it('parses screenshot_overrides.v1 payloads', () => {
    const overrides = readStepScreenshotOverridesV1({
      id: 'step_1',
      screenshot_overrides: {
        focus: {
          center_unit: { x: 0.5, y: 0.25 },
          zoom_scale: 1.8,
        },
        cursor: {
          point_unit: { x: 0.6, y: 0.4 },
        },
      },
    })

    assert.deepEqual(overrides, {
      focus: { center_unit: { x: 0.5, y: 0.25 }, zoom_scale: 1.8 },
      cursor: { point_unit: { x: 0.6, y: 0.4 } },
    })
  })

  it('derives focus using variant dimensions and clamps to nearest click step by capture timestamp', () => {
    const steps = [
      { id: 'step_1', kind: 'click_target' },
      { id: 'step_2', kind: 'type_into_field' },
      { id: 'step_3', kind: 'click_target' },
    ]

    const derived = deriveGuideStepImagesWithFocus({
      steps: steps as any,
      stepImages: [
        {
          step_id: 'step_1',
          capture_t_s: 10,
          radar: {
            x: 200,
            y: 100,
            coordinate_space: 'step_image_pixels_v1',
            confidence: 0.9,
          },
          variants: {
            full: { width: 1000, height: 800, download_url: 'https://example.com/full.png' },
            preview: null,
          },
        },
        {
          step_id: 'step_2',
          capture_t_s: 12,
          variants: {
            full: { width: 1000, height: 800, download_url: 'https://example.com/full.png' },
            preview: null,
          },
        },
        {
          step_id: 'step_3',
          width: 1000,
          height: 800,
          capture_t_s: 15,
          radar: {
            x: 900,
            y: 700,
            coordinate_space: 'step_image_pixels_v1',
            confidence: 0.9,
          },
        },
      ] as any,
    })

    assert.equal(derived['step_1']?.focusSource, 'radar')
    assert.equal(derived['step_2']?.focusSource, 'clamped_click')
    assert.equal(derived['step_2']?.clampedFromStepId, 'step_1')
    assert.deepEqual(derived['step_2']?.image.render_hints?.focus_center, {
      x: 200,
      y: 100,
      coordinate_space: 'step_image_pixels_v1',
    })
  })

  it('prefers manual overrides over derived focus', () => {
    const steps = [
      { id: 'step_1', kind: 'click_target' },
      {
        id: 'step_2',
        kind: 'click_target',
        screenshot_overrides: {
          focus: {
            center_unit: { x: 0.1, y: 0.2 },
            zoom_scale: 2,
          },
          cursor: {
            point_unit: { x: 0.3, y: 0.4 },
          },
        },
      },
    ]

    const derived = deriveGuideStepImagesWithFocus({
      steps: steps as any,
      stepImages: [
        {
          step_id: 'step_1',
          width: 1000,
          height: 800,
          radar: { x: 800, y: 100, coordinate_space: 'step_image_pixels_v1', confidence: 0.9 },
        },
        {
          step_id: 'step_2',
          width: 1000,
          height: 800,
          radar: { x: 900, y: 700, coordinate_space: 'step_image_pixels_v1', confidence: 0.9 },
        },
      ] as any,
    })

    assert.equal(derived['step_2']?.focusSource, 'manual_override')
    assert.deepEqual(derived['step_2']?.image.render_hints?.focus_center, {
      x: 100,
      y: 160,
      coordinate_space: 'step_image_pixels_v1',
    })
    assert.deepEqual(derived['step_2']?.image.radar, {
      x: 300,
      y: 320,
      coordinate_space: 'step_image_pixels_v1',
      confidence: 1,
      reason_code: 'manual_override',
    })
  })
})

