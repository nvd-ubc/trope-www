'use client'

import { useCsrfToken } from '@/lib/client/use-csrf-token'
import Button from '@/components/ui/button'

export default function SignOutForm() {
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()

  return (
    <form action="/api/auth/signout" method="post">
      <input type="hidden" name="csrf_token" value={csrfToken} />
      <Button
        variant="outline"
        size="sm"
        disabled={csrfLoading || !csrfToken}
      >
        Sign out
      </Button>
    </form>
  )
}
