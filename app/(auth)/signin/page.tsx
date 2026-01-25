export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Trope account to access your workflows, documentation, and team workspace.',
}

export const dynamic = 'force-dynamic'

import SignInForm from './signin-form'
import { redirect } from 'next/navigation'
import { readAuthSession, safeRedirectPath } from '@/lib/server/auth'

type SignInSearchParams = {
  client?: string | string[]
  state?: string | string[]
  redirect?: string | string[]
  platform?: string | string[]
  next?: string | string[]
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const hasDesktopIntent = (params: SignInSearchParams) => {
  const client = (toSingle(params.client) ?? '').trim()
  const state = (toSingle(params.state) ?? '').trim()
  const redirectUri = (toSingle(params.redirect) ?? '').trim()
  return client === 'desktop' || Boolean(state && redirectUri)
}

export default async function SignIn({
  searchParams,
}: {
  searchParams?: SignInSearchParams | Promise<SignInSearchParams>
}) {
  const resolvedParams = await Promise.resolve(searchParams)
  const session = await readAuthSession()
  const isAuthenticated = Boolean(session?.accessToken || session?.refreshToken)

  if (isAuthenticated) {
    const intent = resolvedParams ?? {}
    const state = (toSingle(intent.state) ?? '').trim()
    const redirectUri = (toSingle(intent.redirect) ?? '').trim()
    const platform = (toSingle(intent.platform) ?? '').trim()
    if (hasDesktopIntent(intent) && state && redirectUri) {
      const handoffParams = new URLSearchParams()
      handoffParams.set('state', state)
      handoffParams.set('redirect', redirectUri)
      if (platform) handoffParams.set('platform', platform)
      redirect(`/api/auth/desktop-handoff?${handoffParams.toString()}`)
    }

    const nextPath = (toSingle(intent.next) ?? '').trim()
    redirect(safeRedirectPath(nextPath))
  }

  return <SignInForm />
}
