// Site-wide constants

// Contact information
export const CONTACT_EMAIL = 'sales@trope.ai'
export const SUPPORT_EMAIL = 'support@trope.ai'
export const PRESS_EMAIL = 'press@trope.ai'

// Download URLs (override in env for private beta distribution)
export const DOWNLOAD_MAC_URL =
  process.env.NEXT_PUBLIC_TROPE_DOWNLOAD_MAC_URL ?? ''
export const DOWNLOAD_WINDOWS_URL =
  process.env.NEXT_PUBLIC_TROPE_DOWNLOAD_WINDOWS_URL ?? ''

// Scheduling link (optional)
export const SALES_CALL_URL =
  process.env.NEXT_PUBLIC_TROPE_SALES_CALL_URL ?? ''
