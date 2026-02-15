import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildSaveFingerprint,
  createDraftStep,
  getRadarPercent,
  normalizeSpecForPublish,
} from '../src/lib/guide-editor'

describe('guide editor helpers', () => {
  it('normalizes spec fields required for publish', () => {
    const normalized = normalizeSpecForPublish(
      {
        workflow_title: '',
        app: '',
        version: '',
        steps: [
          {
            id: '',
            title: '',
            instructions: '',
            anchors: {
              text: null as unknown as unknown[],
              icons: undefined,
              layout: 'left' as unknown as unknown[],
            },
            video_ranges: undefined,
          },
        ],
      },
      'Fallback Workflow',
      '9'
    )

    assert.equal(normalized.workflow_title, 'Fallback Workflow')
    assert.equal(normalized.app, 'Desktop')
    assert.equal(normalized.version, '9')
    assert.equal(normalized.steps.length, 1)
    assert.equal(normalized.steps[0]?.id, 'step_1')
    assert.equal(normalized.steps[0]?.title, 'Step 1')
    assert.equal(normalized.steps[0]?.instructions, 'Follow this step.')
    assert.deepEqual(normalized.steps[0]?.anchors?.text, [])
    assert.deepEqual(normalized.steps[0]?.anchors?.icons, [])
    assert.deepEqual(normalized.steps[0]?.anchors?.layout, [])
    assert.deepEqual(normalized.steps[0]?.video_ranges, [])
  })

  it('produces stable fingerprints for equivalent specs', () => {
    const specA = {
      workflow_title: 'A',
      app: 'Desktop',
      version: '1',
      steps: [
        {
          id: 'step_1',
          title: 'First',
          instructions: 'Do first thing',
          anchors: { text: [], icons: [], layout: [] },
          video_ranges: [],
        },
      ],
    }
    const specB = {
      workflow_title: 'A',
      app: 'Desktop',
      version: '1',
      steps: [
        {
          id: 'step_1',
          title: 'First',
          instructions: 'Do first thing',
          anchors: { text: [], icons: [], layout: [] },
          video_ranges: [],
        },
      ],
    }

    assert.equal(buildSaveFingerprint(specA, 'Fallback'), buildSaveFingerprint(specB, 'Fallback'))
  })

  it('ensures normalized step ids are unique without collapsing case', () => {
    const normalized = normalizeSpecForPublish(
      {
        workflow_title: 'A',
        app: 'Desktop',
        version: '1',
        steps: [
          {
            id: 'step_1',
            title: 'First',
            instructions: 'One',
            anchors: { text: [], icons: [], layout: [] },
            video_ranges: [],
          },
          {
            id: 'Step_1',
            title: 'Second',
            instructions: 'Two',
            anchors: { text: [], icons: [], layout: [] },
            video_ranges: [],
          },
          {
            id: 'step_1',
            title: 'Third',
            instructions: 'Three',
            anchors: { text: [], icons: [], layout: [] },
            video_ranges: [],
          },
        ],
      },
      'Fallback'
    )

    assert.deepEqual(
      normalized.steps.map((step) => step.id),
      ['step_1', 'Step_1', 'step_1_2']
    )
  })

  it('calculates radar percentages and clamps values', () => {
    const inside = getRadarPercent(
      { x: 50, y: 20, coordinate_space: 'step_image_pixels_v1' },
      200,
      100
    )
    assert.deepEqual(inside, { left: 25, top: 20 })

    const clamped = getRadarPercent(
      { x: 500, y: -20, coordinate_space: 'step_image_pixels_v1' },
      100,
      100
    )
    assert.deepEqual(clamped, { left: 100, top: 0 })

    assert.equal(
      getRadarPercent({ x: 1, y: 2, coordinate_space: 'virtual_desktop_pixels_v1' }, 100, 100),
      null
    )
  })

  it('creates manual callout drafts with stable defaults', () => {
    const step = createDraftStep()
    assert.equal(step.kind, 'manual')
    assert.equal(step.callout_style, 'note')
    assert.deepEqual(step.video_ranges, [])
    assert.deepEqual(step.anchors?.layout, [{ position_hint: 'manual' }])
  })

  it('normalizes callout style only for manual steps', () => {
    const normalized = normalizeSpecForPublish(
      {
        workflow_title: 'Guide',
        app: 'Desktop',
        version: '1',
        steps: [
          {
            id: 'manual_1',
            title: 'Heads up',
            instructions: 'Double-check this.',
            kind: 'manual',
            callout_style: 'ALERT',
            anchors: { text: [], icons: [], layout: [{ position_hint: 'manual' }] },
            video_ranges: [],
          },
          {
            id: 'step_2',
            title: 'Click save',
            instructions: 'Save changes.',
            kind: 'click_target',
            callout_style: 'tip',
            anchors: { text: [], icons: [], layout: [] },
            video_ranges: [{ start_s: 0, end_s: 1 }],
          },
        ],
      },
      'Fallback'
    )

    assert.equal(normalized.steps[0]?.callout_style, 'alert')
    assert.equal(normalized.steps[1]?.callout_style, undefined)
  })
})
