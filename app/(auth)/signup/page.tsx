export const metadata = {
  title: 'Sign Up',
  description: 'Request access or accept an invite to join the Trope closed beta.',
}

export const dynamic = 'force-dynamic'

import SignUpForm from './signup-form'

type SignUpSearchParams = {
  error?: string
  requested?: string
  next?: string
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return undefined
}

const normalizeStage = (value: string): string => {
  const trimmed = value.trim().toLowerCase()
  return trimmed || 'dev'
}

const isSelfSignupEnabled = () => {
  const stageRaw =
    process.env.TROPE_STAGE ||
    process.env.NEXT_PUBLIC_TROPE_STAGE ||
    (process.env.NODE_ENV === 'production' ? 'prod' : 'dev')
  const stage = normalizeStage(stageRaw)
  const override =
    parseBoolean(process.env.TROPE_SELF_SIGNUP_ENABLED) ??
    parseBoolean(process.env.NEXT_PUBLIC_TROPE_SELF_SIGNUP_ENABLED)
  return override ?? stage !== 'prod'
}

export default function SignUp({
  searchParams,
}: {
  searchParams?: SignUpSearchParams
}) {
  const selfSignupEnabled = isSelfSignupEnabled()
  const error = toSingle(searchParams?.error)
  const requested = toSingle(searchParams?.requested)
  const next = toSingle(searchParams?.next)

  return (
    <SignUpForm
      selfSignupEnabled={selfSignupEnabled}
      error={error}
      requested={requested}
      nextPath={next}
    />
  )
}
