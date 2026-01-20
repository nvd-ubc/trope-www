export const metadata = {
  title: 'Sign Up',
  description: 'Create your free Trope account and start automating workflows with living documentation and in-app guidance.',
}

export const dynamic = 'force-dynamic'

import SignUpForm from './signup-form'
import { getAuthConfig } from '@/lib/server/auth-config'

type SignUpSearchParams = {
  error?: string
  requested?: string
  next?: string
  blocked?: string
  email?: string
}

type InvitePayload = {
  invite?: {
    org_id: string
    org_name: string
    invite_id: string
    role: string
    status: string
    created_at: string
    expires_at?: number | null
    invited_email_hint?: string | null
    invited_email?: string | null
  }
  error?: string
  message?: string
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const parseInviteFromNext = (nextPath?: string): { orgId: string; inviteId: string } | null => {
  if (!nextPath) return null
  try {
    const url = new URL(nextPath, 'https://trope.ai')
    if (url.pathname !== '/invite') return null
    const orgId = (url.searchParams.get('org_id') ?? '').trim()
    const inviteId = (url.searchParams.get('invite_id') ?? '').trim()
    if (!orgId || !inviteId) return null
    return { orgId, inviteId }
  } catch {
    return null
  }
}

const fetchInviteMetadata = async (orgId: string, inviteId: string) => {
  const config = getAuthConfig()
  const response = await fetch(
    `${config.apiBaseUrl}/v1/orgs/${encodeURIComponent(orgId)}/invites/${encodeURIComponent(inviteId)}`,
    { cache: 'no-store' }
  )
  const payload = (await response.json().catch(() => null)) as InvitePayload | null
  if (!response.ok) return null
  return payload?.invite ?? null
}

export default async function SignUp({
  searchParams,
}: {
  searchParams?: SignUpSearchParams
}) {
  const error = toSingle(searchParams?.error)
  const requested = toSingle(searchParams?.requested)
  const next = toSingle(searchParams?.next)
  const blocked = toSingle(searchParams?.blocked) === '1'
  const prefillEmail = toSingle(searchParams?.email)
  const inviteParams = parseInviteFromNext(next)
  const invite = inviteParams ? await fetchInviteMetadata(inviteParams.orgId, inviteParams.inviteId) : null

  return (
    <SignUpForm
      error={error}
      requested={requested}
      nextPath={next}
      blocked={blocked}
      prefillEmail={prefillEmail}
      invite={invite ?? undefined}
    />
  )
}
