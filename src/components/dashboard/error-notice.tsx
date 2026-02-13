'use client'

import { type ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Button from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ErrorNoticeProps = {
  message: ReactNode
  requestId?: string | null
  title?: string
  className?: string
  onCopyRequestId?: (requestId: string) => void | Promise<void>
}

export default function ErrorNotice({
  message,
  requestId,
  title = 'Something went wrong',
  className,
  onCopyRequestId,
}: ErrorNoticeProps) {
  const copyRequestId = async () => {
    if (!requestId) return
    if (onCopyRequestId) {
      await onCopyRequestId(requestId)
      return
    }
    await navigator.clipboard.writeText(requestId)
  }

  return (
    <Alert variant="destructive" className={cn('border-destructive/25 bg-destructive/10', className)}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div>{message}</div>
        {requestId && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-destructive/80">Request ID: {requestId}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px] uppercase tracking-wide"
              onClick={copyRequestId}
            >
              Copy
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
