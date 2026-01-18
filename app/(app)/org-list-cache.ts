'use client'

export type OrgListResponse = {
  orgs: Array<{ org_id: string }>
  default_org_id?: string | null
}

export const orgListUpdatedEvent = 'trope-orgs-updated'

let orgListCache: OrgListResponse | null | undefined
let orgListPromise: Promise<OrgListResponse | null> | null = null
let orgListEpoch = 0

export const loadOrgList = async () => {
  if (orgListCache !== undefined) {
    return orgListCache
  }
  if (orgListPromise) {
    return orgListPromise
  }

  const currentEpoch = orgListEpoch
  orgListPromise = (async () => {
    try {
      const response = await fetch('/api/orgs', { cache: 'no-store' })
      if (!response.ok) return null
      return (await response.json().catch(() => null)) as OrgListResponse | null
    } catch {
      return null
    }
  })()

  const payload = await orgListPromise
  if (currentEpoch == orgListEpoch) {
    orgListCache = payload
    orgListPromise = null
  }
  return payload
}

export const notifyOrgListUpdated = () => {
  orgListCache = undefined
  orgListPromise = null
  orgListEpoch += 1
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(orgListUpdatedEvent))
}

export const subscribeOrgListUpdates = (handler: () => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }
  window.addEventListener(orgListUpdatedEvent, handler)
  return () => {
    window.removeEventListener(orgListUpdatedEvent, handler)
  }
}
