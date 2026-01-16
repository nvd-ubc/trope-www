import { execSync } from 'node:child_process'

type AuthConfig = {
  stage: string
  isProd: boolean
  apiBaseUrl: string
  region: string
  webClientId: string
  desktopClientId: string
  selfSignupEnabled: boolean
}

type CloudDefaults = {
  apiBaseUrl?: string
  region?: string
  webClientId?: string
  desktopClientId?: string
}

let cachedConfig: AuthConfig | null = null

const DEFAULT_REGION = 'us-west-2'
const STAGE_DEFAULTS: Record<string, CloudDefaults> = {
  prod: {
    apiBaseUrl: 'https://4ubla7lekl.execute-api.us-west-2.amazonaws.com',
    region: DEFAULT_REGION,
    webClientId: '6cirfe7fstgcrimotkj8dhao',
    desktopClientId: 'ef5k0q9tfu11e186eavcf0re0',
  },
  dev: {
    apiBaseUrl: 'https://y9o3ly11z3.execute-api.us-west-2.amazonaws.com',
    region: DEFAULT_REGION,
    webClientId: '4jp14fc9huc5mnq7uu4seg84ok',
    desktopClientId: '185pu34bemq1tp5lagdgpddt07',
  },
}

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim()
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

const normalizeValue = (value: string | undefined): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

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

const stageDefaultsFor = (stage: string): CloudDefaults => {
  const normalized = normalizeStage(stage)
  return STAGE_DEFAULTS[normalized] ?? STAGE_DEFAULTS.dev
}

const parseCloudFormationOutputs = (payload: string): CloudDefaults => {
  try {
    const parsed = JSON.parse(payload) as {
      Stacks?: Array<{ Outputs?: Array<{ OutputKey?: string; OutputValue?: string }> }>
    }
    const outputs = parsed.Stacks?.[0]?.Outputs
    if (!Array.isArray(outputs)) return {}

    const findValue = (key: string): string | undefined => {
      const output = outputs.find(item => item.OutputKey === key)
      return normalizeValue(output?.OutputValue)
    }

    const findFirst = (keys: string[]): string | undefined => {
      for (const key of keys) {
        const value = findValue(key)
        if (value) return value
      }
      return undefined
    }

    return {
      apiBaseUrl: findValue('HttpApiUrl'),
      webClientId: findFirst(['UserPoolWebClientId', 'UserPoolClientId']),
      desktopClientId: findFirst(['UserPoolDesktopClientId', 'UserPoolClientId']),
    }
  } catch {
    return {}
  }
}

const tryReadAwsRegion = (): string | undefined => {
  try {
    const output = execSync('aws configure get region', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return normalizeValue(output)
  } catch {
    return undefined
  }
}

const hasCloudValues = (defaults: CloudDefaults): boolean =>
  Boolean(defaults.apiBaseUrl || defaults.webClientId || defaults.desktopClientId)

const loadCloudDefaults = (stage: string, regionHint: string | undefined): CloudDefaults | null => {
  const outputsJson =
    normalizeValue(process.env.TROPE_CLOUD_DEFAULTS_JSON) ||
    normalizeValue(process.env.TROPE_CLOUDFORMATION_OUTPUTS_JSON)

  const region = regionHint || tryReadAwsRegion() || DEFAULT_REGION

  if (outputsJson) {
    const parsed = parseCloudFormationOutputs(outputsJson)
    if (!hasCloudValues(parsed)) return null
    return { ...parsed, region }
  }

  if (process.env.NODE_ENV === 'test') {
    return null
  }

  try {
    const stackName = `TropeBackend-${normalizeStage(stage)}`
    const output = execSync(
      `aws cloudformation describe-stacks --stack-name ${stackName} --region ${region}`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    )
    const parsed = parseCloudFormationOutputs(output)
    if (!hasCloudValues(parsed)) return null
    return { ...parsed, region }
  } catch {
    return null
  }
}

export const __resetAuthConfigForTests = () => {
  cachedConfig = null
}

export const getAuthConfig = (): AuthConfig => {
  if (cachedConfig) return cachedConfig

  const stageRaw =
    process.env.TROPE_STAGE ||
    process.env.NEXT_PUBLIC_TROPE_STAGE ||
    (process.env.NODE_ENV === 'production' ? 'prod' : 'dev')
  const stage = normalizeStage(stageRaw)

  let apiBaseUrlRaw =
    normalizeValue(process.env.TROPE_API_URL) ||
    normalizeValue(process.env.TROPE_BACKEND_API_URL) ||
    normalizeValue(process.env.NEXT_PUBLIC_TROPE_API_URL)

  let region =
    normalizeValue(process.env.TROPE_COGNITO_REGION) ||
    normalizeValue(process.env.AWS_REGION) ||
    normalizeValue(process.env.AWS_DEFAULT_REGION)

  let webClientId =
    normalizeValue(process.env.TROPE_COGNITO_WEB_CLIENT_ID) ||
    normalizeValue(process.env.TROPE_COGNITO_CLIENT_ID)

  let desktopClientId = normalizeValue(process.env.TROPE_COGNITO_DESKTOP_CLIENT_ID)

  if (!apiBaseUrlRaw || !region || !webClientId || !desktopClientId) {
    const cloudDefaults = loadCloudDefaults(stage, region)
    if (cloudDefaults) {
      apiBaseUrlRaw = apiBaseUrlRaw ?? cloudDefaults.apiBaseUrl
      region = region ?? cloudDefaults.region
      webClientId = webClientId ?? cloudDefaults.webClientId
      desktopClientId = desktopClientId ?? cloudDefaults.desktopClientId
    }
  }

  if (!apiBaseUrlRaw || !region || !webClientId || !desktopClientId) {
    const defaults = stageDefaultsFor(stage)
    apiBaseUrlRaw = apiBaseUrlRaw ?? defaults.apiBaseUrl
    region = region ?? defaults.region
    const shouldDefaultDesktopClientId = !desktopClientId && !webClientId
    webClientId = webClientId ?? defaults.webClientId
    if (shouldDefaultDesktopClientId) {
      desktopClientId = desktopClientId ?? defaults.desktopClientId
    }
  }

  if (!apiBaseUrlRaw) {
    throw new Error('TROPE_API_URL is not configured.')
  }
  if (!region) {
    throw new Error('TROPE_COGNITO_REGION is not configured.')
  }
  if (!webClientId) {
    throw new Error('TROPE_COGNITO_WEB_CLIENT_ID is not configured.')
  }

  const resolvedDesktopClientId = desktopClientId ?? webClientId

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
    desktopClientId: resolvedDesktopClientId,
    selfSignupEnabled,
  }

  return cachedConfig
}
