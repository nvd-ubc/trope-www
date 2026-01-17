export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Trope account to access your workflows, documentation, and team workspace.',
}

export const dynamic = 'force-dynamic'

import SignInForm from './signin-form'

export default function SignIn() {
  return <SignInForm />
}
