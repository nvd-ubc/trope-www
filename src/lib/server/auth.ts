import 'server-only'

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider'

type AuthClientKind = 'web' | 'desktop'

type AuthTokens = {
  accessToken: string
  refreshToken?: string
  idToken?: string
  expiresIn: number
}

type AuthSession = {
  accessToken: string
  refreshToken?: string
  idToken?: string
  expiresAt: number
}

type AuthConfig = {
  stage: string
  isProd: boolean
  apiBaseUrl: string
  region: string
  webClientId: string
  desktopClientId: string
  selfSignupEnabled: boolean
}

const ACCESS_COOKIE = 'trope_access_token'
const REFRESH_COOKIE = 'trope_refresh_token'
const ID_COOKIE = 'trope_id_token'
const EXPIRES_AT_COOKIE = 'trope_access_expires_at'

let cachedConfig: AuthConfig | null = null
let cachedCognitoClient: CognitoIdentityProviderClient | null = null

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim()
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return undefined
}

export const getAuthConfig = (): AuthConfig => {
  if (cachedConfig) return cachedConfig

  const stage =
    process.env.TROPE_STAGE ||
    process.env.NEXT_PUBLIC_TROPE_STAGE ||
    (process.env.NODE_ENV === 'production' ? 'prod' : 'dev')

  const apiBaseUrlRaw =
    process.env.TROPE_API_URL ||
    process.env.TROPE_BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_TROPE_API_URL ||
    ''

  const region =
    process.env.TROPE_COGNITO_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    ''

  const webClientId =
    process.env.TROPE_COGNITO_WEB_CLIENT_ID ||
    process.env.TROPE_COGNITO_CLIENT_ID ||
    ''

  const desktopClientId =
    process.env.TROPE_COGNITO_DESKTOP_CLIENT_ID || webClientId

  if (!apiBaseUrlRaw) {
    throw new Error('TROPE_API_URL is not configured.')
  }
  if (!region) {
    throw new Error('TROPE_COGNITO_REGION is not configured.')
  }
  if (!webClientId) {
    throw new Error('TROPE_COGNITO_WEB_CLIENT_ID is not configured.')
  }

  const signupOverride =
    parseBoolean(process.env.TROPE_SELF_SIGNUP_ENABLED) ??
    parseBoolean(process.env.NEXT_PUBLIC_TROPE_SELF_SIGNUP_ENABLED)

  const selfSignupEnabled = signupOverride ?? stage !== 'prod'

  cachedConfig = {
    stage,
    isProd: stage === 'prod',
    apiBaseUrl: normalizeUrl(apiBaseUrlRaw),
    region,
    webClientId,
    desktopClientId,
    selfSignupEnabled,
  }

  return cachedConfig
}

const getCognitoClient = (): CognitoIdentityProviderClient => {
  if (cachedCognitoClient) return cachedCognitoClient
  const { region } = getAuthConfig()
  cachedCognitoClient = new CognitoIdentityProviderClient({ region })
  return cachedCognitoClient
}

const pickClientId = (kind: AuthClientKind): string => {
  const config = getAuthConfig()
  return kind === 'desktop' ? config.desktopClientId : config.webClientId
}

export const safeRedirectPath = (value?: string | null): string => {
  if (!value) return '/dashboard'
  if (value.startsWith('/') && !value.startsWith('//')) {
    return value
  }
  return '/dashboard'
}

export const signInWithPassword = async (
  email: string,
  password: string,
  kind: AuthClientKind
): Promise<AuthTokens> => {
  const client = getCognitoClient()
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: pickClientId(kind),
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  })

  const response = await client.send(command)
  const result = response.AuthenticationResult
  if (!result?.AccessToken || !result.ExpiresIn) {
    throw new Error('auth_response_invalid')
  }

  return {
    accessToken: result.AccessToken,
    refreshToken: result.RefreshToken,
    idToken: result.IdToken,
    expiresIn: result.ExpiresIn,
  }
}

export const refreshTokens = async (
  refreshToken: string,
  kind: AuthClientKind = 'web'
): Promise<AuthTokens> => {
  const client = getCognitoClient()
  const command = new InitiateAuthCommand({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: pickClientId(kind),
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  })

  const response = await client.send(command)
  const result = response.AuthenticationResult
  if (!result?.AccessToken || !result.ExpiresIn) {
    throw new Error('auth_response_invalid')
  }

  return {
    accessToken: result.AccessToken,
    refreshToken: result.RefreshToken ?? refreshToken,
    idToken: result.IdToken,
    expiresIn: result.ExpiresIn,
  }
}

export const signUp = async (params: {
  email: string
  password: string
  name?: string
  company?: string
}): Promise<void> => {
  const client = getCognitoClient()
  const config = getAuthConfig()

  const attributes = [{ Name: 'email', Value: params.email }]
  if (params.name) {
    attributes.push({ Name: 'name', Value: params.name })
  }

  const command = new SignUpCommand({
    ClientId: config.webClientId,
    Username: params.email,
    Password: params.password,
    UserAttributes: attributes,
    ClientMetadata: params.company ? { company: params.company } : undefined,
  })

  await client.send(command)
}

export const forgotPassword = async (email: string): Promise<void> => {
  const client = getCognitoClient()
  const config = getAuthConfig()
  const command = new ForgotPasswordCommand({
    ClientId: config.webClientId,
    Username: email,
  })

  await client.send(command)
}

export const confirmForgotPassword = async (params: {
  email: string
  code: string
  newPassword: string
}): Promise<void> => {
  const client = getCognitoClient()
  const config = getAuthConfig()
  const command = new ConfirmForgotPasswordCommand({
    ClientId: config.webClientId,
    Username: params.email,
    ConfirmationCode: params.code,
    Password: params.newPassword,
  })

  await client.send(command)
}

export const readAuthSession = async (): Promise<AuthSession | null> => {
  const store = await cookies()
  const accessToken = store.get(ACCESS_COOKIE)?.value ?? ''
  if (!accessToken) return null

  const refreshToken = store.get(REFRESH_COOKIE)?.value
  const idToken = store.get(ID_COOKIE)?.value
  const expiresAtRaw = store.get(EXPIRES_AT_COOKIE)?.value
  const expiresAt = expiresAtRaw ? Number.parseInt(expiresAtRaw, 10) : 0

  return {
    accessToken,
    refreshToken,
    idToken,
    expiresAt,
  }
}

export const setAuthCookies = (
  response: NextResponse,
  tokens: AuthTokens,
  options?: { rememberRefresh?: boolean }
): void => {
  const config = getAuthConfig()
  const expiresAt = Date.now() + tokens.expiresIn * 1000
  const secure = config.isProd
  const base = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/' }

  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: Math.max(0, tokens.expiresIn),
  })
  response.cookies.set(EXPIRES_AT_COOKIE, String(expiresAt), {
    ...base,
    maxAge: Math.max(0, tokens.expiresIn),
  })

  if (tokens.idToken) {
    response.cookies.set(ID_COOKIE, tokens.idToken, {
      ...base,
      maxAge: Math.max(0, tokens.expiresIn),
    })
  }

  const rememberRefresh = options?.rememberRefresh ?? true
  if (rememberRefresh && tokens.refreshToken) {
    response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
      ...base,
      maxAge: 60 * 60 * 24 * 30,
    })
  }
}

export const clearAuthCookies = (response: NextResponse): void => {
  const base = { path: '/' }
  response.cookies.set(ACCESS_COOKIE, '', { ...base, maxAge: 0 })
  response.cookies.set(REFRESH_COOKIE, '', { ...base, maxAge: 0 })
  response.cookies.set(ID_COOKIE, '', { ...base, maxAge: 0 })
  response.cookies.set(EXPIRES_AT_COOKIE, '', { ...base, maxAge: 0 })
}

export const getSessionWithRefresh = async (): Promise<{
  session: AuthSession
  refreshed: boolean
  tokens?: AuthTokens
} | null> => {
  const session = await readAuthSession()
  if (!session) return null

  const now = Date.now()
  const needsRefresh = session.expiresAt > 0 && session.expiresAt <= now + 30_000
  if (!needsRefresh) {
    return { session, refreshed: false }
  }

  if (!session.refreshToken) {
    return null
  }

  const refreshedTokens = await refreshTokens(session.refreshToken, 'web')
  const refreshedSession: AuthSession = {
    accessToken: refreshedTokens.accessToken,
    refreshToken: refreshedTokens.refreshToken,
    idToken: refreshedTokens.idToken,
    expiresAt: Date.now() + refreshedTokens.expiresIn * 1000,
  }

  return { session: refreshedSession, refreshed: true, tokens: refreshedTokens }
}

export const authErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return 'Unexpected authentication error.'
  const record = error as { name?: string; message?: string }
  const name = record.name ?? ''

  switch (name) {
    case 'NotAuthorizedException':
      return 'Incorrect email or password.'
    case 'UserNotFoundException':
      return 'No account found for that email.'
    case 'UserNotConfirmedException':
      return 'Please verify your email before signing in.'
    case 'PasswordResetRequiredException':
      return 'Password reset required. Check your email.'
    case 'UsernameExistsException':
      return 'An account with this email already exists.'
    case 'InvalidPasswordException':
      return 'Password does not meet the requirements.'
    case 'InvalidParameterException':
      return 'Invalid request. Check the form and try again.'
    case 'CodeMismatchException':
      return 'Verification code is incorrect.'
    case 'ExpiredCodeException':
      return 'Verification code expired.'
    case 'TooManyRequestsException':
    case 'LimitExceededException':
      return 'Too many attempts. Please wait and try again.'
    default:
      return record.message ?? 'Unexpected authentication error.'
  }
}
