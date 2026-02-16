export const GUIDE_CURSOR_OVERLAY_MODES = ['radar_dot', 'none'] as const

export type GuideCursorOverlayMode = (typeof GUIDE_CURSOR_OVERLAY_MODES)[number]

export const DEFAULT_GUIDE_CURSOR_OVERLAY_MODE: GuideCursorOverlayMode = 'radar_dot'

const GUIDE_CURSOR_OVERLAY_MODE_SET = new Set<string>(GUIDE_CURSOR_OVERLAY_MODES)

export const parseGuideCursorOverlayMode = (value: unknown): GuideCursorOverlayMode | null => {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  return GUIDE_CURSOR_OVERLAY_MODE_SET.has(normalized)
    ? (normalized as GuideCursorOverlayMode)
    : null
}

export const resolveGuideCursorOverlayMode = (
  value: unknown,
  fallback: GuideCursorOverlayMode = DEFAULT_GUIDE_CURSOR_OVERLAY_MODE
): GuideCursorOverlayMode => parseGuideCursorOverlayMode(value) ?? fallback
