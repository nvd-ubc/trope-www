export const metadata = {
  title: 'Reset Password',
  description: 'Reset your Trope account password to regain access to your workspace.',
}

export const dynamic = 'force-dynamic'

import ResetPasswordForm from './reset-password-form'
import { cookies } from 'next/headers'

type ResetSearchParams = {
  error?: string
  sent?: string
  step?: string
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function ResetPassword({
  searchParams,
}: {
  searchParams?: ResetSearchParams | Promise<ResetSearchParams>
}) {
  const resolvedParams = await Promise.resolve(searchParams)
  const error = toSingle(resolvedParams?.error)
  const sent = toSingle(resolvedParams?.sent)
  const requestedStep = toSingle(resolvedParams?.step)
  const step = requestedStep === 'confirm' || sent ? 'confirm' : 'request'
  const cookieStore = await cookies()
  const initialEmail = cookieStore.get('trope_reset_email')?.value ?? ''

  return <ResetPasswordForm error={error} sent={sent} step={step} initialEmail={initialEmail} />
}
