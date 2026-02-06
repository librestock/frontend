'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface FormErrorBannerProps {
  errors?: unknown[]
  className?: string
}

function extractZodErrors(obj: Record<string, unknown>): string | null {
  const zodErrors = obj._errors
  if (!Array.isArray(zodErrors)) return null
  if (!zodErrors.every((e) => typeof e === 'string')) return null
  const joined = zodErrors.join(', ')
  return joined.length > 0 ? joined : null
}

function extractStringProp(
  obj: Record<string, unknown>,
  key: string,
): string | null {
  const value = obj[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function formatFormError(error: unknown): string | null {
  if (error == null) return null
  if (typeof error === 'string') return error
  if (typeof error === 'number' || typeof error === 'boolean') {
    return String(error)
  }
  if (typeof error !== 'object') {
    // Handle edge cases like symbols, functions, etc.
    return safeStringify(error)
  }

  const obj = error as Record<string, unknown>

  return (
    extractStringProp(obj, 'form') ??
    extractStringProp(obj, 'message') ??
    extractZodErrors(obj) ??
    safeStringify(error)
  )
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function FormErrorBanner({
  errors,
  className,
}: FormErrorBannerProps): React.JSX.Element | null {
  if (!errors || errors.length === 0) return null

  const messages = errors
    .map(formatFormError)
    .filter((msg): msg is string => !!msg)

  if (messages.length === 0) return null

  return (
    <div
      role="alert"
      className={cn(
        'bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm',
        className,
      )}
    >
      {messages.join(', ')}
    </div>
  )
}
