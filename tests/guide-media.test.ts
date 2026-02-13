import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  formatCaptureTimestamp,
  resolveStepImageVariant,
  shouldRenderStepRadar,
  type GuideMediaStepImage,
} from '../src/lib/guide-media'

const stepImageFixture = (): GuideMediaStepImage => ({
  step_id: 'step_1',
  download_url: 'https://legacy.example/step_1.jpg',
  content_type: 'image/jpeg',
  width: 1920,
  height: 1080,
  variants: {
    preview: {
      download_url: 'https://preview.example/step_1.jpg',
      content_type: 'image/jpeg',
      width: 768,
      height: 432,
    },
    full: {
      download_url: 'https://full.example/step_1.jpg',
      content_type: 'image/jpeg',
      width: 1920,
      height: 1080,
    },
  },
})

describe('guide media helpers', () => {
  it('prefers preview assets for card surfaces', () => {
    const resolved = resolveStepImageVariant(stepImageFixture(), {
      surface: 'card',
      requestedVariant: 'auto',
    })

    assert.equal(resolved.selectedVariant, 'preview')
    assert.equal(resolved.downloadUrl, 'https://preview.example/step_1.jpg')
    assert.equal(resolved.width, 768)
    assert.equal(resolved.height, 432)
  })

  it('prefers full assets for detail surfaces', () => {
    const resolved = resolveStepImageVariant(stepImageFixture(), {
      surface: 'detail',
      requestedVariant: 'auto',
    })

    assert.equal(resolved.selectedVariant, 'full')
    assert.equal(resolved.downloadUrl, 'https://full.example/step_1.jpg')
    assert.equal(resolved.width, 1920)
    assert.equal(resolved.height, 1080)
  })

  it('falls back from preview to full when preview url is unavailable', () => {
    const image = stepImageFixture()
    if (!image.variants?.preview) {
      throw new Error('fixture setup failed')
    }
    image.variants.preview.download_url = null

    const resolved = resolveStepImageVariant(image, {
      surface: 'card',
      requestedVariant: 'preview',
    })

    assert.equal(resolved.selectedVariant, 'full')
    assert.equal(resolved.downloadUrl, 'https://full.example/step_1.jpg')
  })

  it('falls back to legacy url when variants are missing urls', () => {
    const image = stepImageFixture()
    if (!image.variants?.preview || !image.variants.full) {
      throw new Error('fixture setup failed')
    }
    image.variants.preview.download_url = ''
    image.variants.full.download_url = null

    const resolved = resolveStepImageVariant(image, {
      surface: 'card',
      requestedVariant: 'preview',
    })

    assert.equal(resolved.selectedVariant, 'legacy')
    assert.equal(resolved.downloadUrl, 'https://legacy.example/step_1.jpg')
    assert.equal(resolved.width, 768)
    assert.equal(resolved.height, 432)
  })

  it('returns null download url when no url is available', () => {
    const image = stepImageFixture()
    image.download_url = null
    if (!image.variants?.preview || !image.variants.full) {
      throw new Error('fixture setup failed')
    }
    image.variants.preview.download_url = null
    image.variants.full.download_url = null

    const resolved = resolveStepImageVariant(image, {
      surface: 'detail',
      requestedVariant: 'full',
    })

    assert.equal(resolved.selectedVariant, null)
    assert.equal(resolved.downloadUrl, null)
    assert.equal(resolved.width, 1920)
    assert.equal(resolved.height, 1080)
  })

  it('formats capture timestamps for display', () => {
    assert.equal(formatCaptureTimestamp(0), '0:00')
    assert.equal(formatCaptureTimestamp(3.2), '0:03')
    assert.equal(formatCaptureTimestamp(64.2), '1:04')
    assert.equal(formatCaptureTimestamp(-1), null)
    assert.equal(formatCaptureTimestamp(null), null)
  })

  it('renders radar only for click-like steps with valid projected coordinates', () => {
    assert.equal(
      shouldRenderStepRadar({
        step: { kind: 'click_target' },
        radar: {
          x: 120,
          y: 40,
          coordinate_space: 'step_image_pixels_v1',
          confidence: 0.86,
          reason_code: 'click_projected_mouse_up',
        },
        width: 240,
        height: 120,
      }),
      true
    )
  })

  it('does not render radar for non-click steps', () => {
    assert.equal(
      shouldRenderStepRadar({
        step: { kind: 'verify_state' },
        radar: {
          x: 120,
          y: 40,
          coordinate_space: 'step_image_pixels_v1',
          confidence: 0.86,
          reason_code: 'click_projected_mouse_up',
        },
        width: 240,
        height: 120,
      }),
      false
    )
  })

  it('does not render fallback center radar even on click steps', () => {
    assert.equal(
      shouldRenderStepRadar({
        step: { kind: 'click_target' },
        radar: {
          x: 120,
          y: 40,
          coordinate_space: 'step_image_pixels_v1',
          confidence: 0.01,
          reason_code: 'default_center',
        },
        width: 240,
        height: 120,
      }),
      false
    )
  })

  it('does not render radar when projected coordinates are out of bounds', () => {
    assert.equal(
      shouldRenderStepRadar({
        step: { kind: 'click_target' },
        radar: {
          x: 1200,
          y: 40,
          coordinate_space: 'step_image_pixels_v1',
          confidence: 0.9,
          reason_code: 'click_projected_window_mouse_up',
        },
        width: 240,
        height: 120,
      }),
      false
    )
  })

  it('accepts expected_event click when step kind is absent', () => {
    assert.equal(
      shouldRenderStepRadar({
        step: { expected_event: { type: 'click' } },
        radar: {
          x: 120,
          y: 40,
          coordinate_space: 'step_image_pixels_v1',
          confidence: 0.86,
          reason_code: 'click_projected_mouse_up',
        },
        width: 240,
        height: 120,
      }),
      true
    )
  })
})
