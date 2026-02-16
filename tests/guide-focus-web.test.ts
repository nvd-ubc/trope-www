import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { clampGuideCanvasScale, computeGuideCanvasFocusTransform } from '../src/lib/guide-focus-web'

describe('guide-focus-web', () => {
  it('clamps guide canvas scale bounds', () => {
    assert.equal(clampGuideCanvasScale(0.4, 1, 4), 1)
    assert.equal(clampGuideCanvasScale(2.2, 1, 4), 2.2)
    assert.equal(clampGuideCanvasScale(8.5, 1, 4), 4)
  })

  it('computes focus transform centered in viewport', () => {
    const transform = computeGuideCanvasFocusTransform({
      focusTransform: {
        cropRect: { x: 0, y: 0, width: 900, height: 600 },
        zoomScale: 2,
        transformOriginPercent: { x: 25, y: 60 },
        radarPercentInCrop: null,
        hasFocusCrop: true,
      },
      viewportWidth: 1000,
      viewportHeight: 700,
      imageWidth: 1200,
      imageHeight: 800,
      minScale: 1,
      maxScale: 4,
    })

    assert.equal(transform.scale, 2)
    assert.equal(transform.positionX, -100)
    assert.equal(transform.positionY, -610)
  })

  it('uses rendered image dimensions for focus offsets', () => {
    const transform = computeGuideCanvasFocusTransform({
      focusTransform: {
        cropRect: { x: 0, y: 0, width: 900, height: 600 },
        zoomScale: 2,
        transformOriginPercent: { x: 75, y: 70 },
        radarPercentInCrop: null,
        hasFocusCrop: true,
      },
      viewportWidth: 900,
      viewportHeight: 600,
      imageWidth: 900,
      imageHeight: 600,
      minScale: 1,
      maxScale: 4,
    })

    assert.equal(transform.positionX, -900)
    assert.equal(transform.positionY, -540)
  })
})
