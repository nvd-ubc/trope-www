export const metadata = {
  title: 'Reset Password',
  description: 'Reset your Trope account password to regain access to your workspace.',
}

export const dynamic = 'force-dynamic'

import ResetPasswordForm from './reset-password-form'

type ResetSearchParams = {
  error?: string
  sent?: string
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default function ResetPassword({
  searchParams,
}: {
  searchParams?: ResetSearchParams
}) {
  const error = toSingle(searchParams?.error)
  const sent = toSingle(searchParams?.sent)

  return <ResetPasswordForm error={error} sent={sent} />
}
