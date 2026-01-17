import InviteClient from './invite-client'
import { getAuthConfig } from '@/lib/server/auth-config'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Invite',
  robots: {
    index: false,
    follow: false,
  },
}

type InviteSearchParams = {
  org_id?: string | string[]
  invite_id?: string | string[]
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
  }
  error?: string
  message?: string
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const fetchInviteMetadata = async (orgId: string, inviteId: string) => {
  const config = getAuthConfig()
  const response = await fetch(
    `${config.apiBaseUrl}/v1/orgs/${encodeURIComponent(orgId)}/invites/${encodeURIComponent(inviteId)}`,
    { cache: 'no-store' }
  )
  const payload = (await response.json().catch(() => null)) as InvitePayload | null
  return {
    status: response.status,
    payload,
  }
}

export default async function InvitePage({
  searchParams,
}: {
  searchParams?: InviteSearchParams
}) {
  const orgId = (toSingle(searchParams?.org_id) ?? '').trim()
  const inviteId = (toSingle(searchParams?.invite_id) ?? '').trim()

  if (!orgId || !inviteId) {
    return <InviteClient orgId={orgId} inviteId={inviteId} inviteData={null} />
  }

  const inviteData = await fetchInviteMetadata(orgId, inviteId)
  return <InviteClient orgId={orgId} inviteId={inviteId} inviteData={inviteData} />
}
