'use client'

import { useEffect, useState } from 'react'

type CsrfState = {
  token: string
  loading: boolean
  error: string | null
}

export const useCsrfToken = (): CsrfState => {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadToken = async () => {
      try {
        const response = await fetch('/api/csrf', { cache: 'no-store' })
        const payload = (await response.json().catch(() => null)) as
          | { csrf_token?: string }
          | null
        if (!active) return
        if (!response.ok) {
          throw new Error('Unable to initialize security token.')
        }
        const value = payload?.csrf_token ?? ''
        setToken(value)
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to initialize security token.')
        setLoading(false)
      }
    }

    loadToken()
    return () => {
      active = false
    }
  }, [])

  return { token, loading, error }
}
