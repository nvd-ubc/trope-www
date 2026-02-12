export const parseProfileNameFields = (params: {
  firstNameInput?: string | null
  lastNameInput?: string | null
  legacyFullName?: string | null
}) => {
  const firstNameInput = (params.firstNameInput ?? '').trim()
  const lastNameInput = (params.lastNameInput ?? '').trim()
  const legacyFullName = (params.legacyFullName ?? '').trim()

  const legacyNameParts = legacyFullName.split(/\s+/).filter(Boolean)
  const firstName = firstNameInput || legacyNameParts[0] || ''
  const lastName =
    lastNameInput || (legacyNameParts.length > 1 ? legacyNameParts.slice(1).join(' ') : '')
  const displayName = `${firstName} ${lastName}`.trim()

  return { firstName, lastName, displayName }
}

export const hasRequiredProfileNames = (profile: {
  first_name?: string | null
  last_name?: string | null
}) => {
  const firstName = (profile.first_name ?? '').trim()
  const lastName = (profile.last_name ?? '').trim()
  return firstName.length > 0 && lastName.length > 0
}

export const safeInternalPath = (value: string | null | undefined): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null
  }
  return trimmed
}
