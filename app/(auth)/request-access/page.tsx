import RequestAccessForm from './request-access-form'

export const metadata = {
  title: 'Request Access',
  description: 'Request access to the Trope closed beta for guided desktop workflows.',
}

export const dynamic = 'force-dynamic'

type RequestAccessSearchParams = {
  error?: string
  requested?: string
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default function RequestAccessPage({
  searchParams,
}: {
  searchParams?: RequestAccessSearchParams
}) {
  const error = toSingle(searchParams?.error)
  const requested = toSingle(searchParams?.requested)

  return <RequestAccessForm error={error} requested={requested} />
}
