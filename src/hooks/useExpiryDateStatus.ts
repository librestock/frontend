import * as React from 'react'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const EXPIRY_STATUS_TICK_MS = 60 * 1000

let currentTimeSnapshot = Date.now()
let expiryIntervalId: number | null = null
const expiryListeners = new Set<() => void>()

function startExpiryTicker(): void {
  if (expiryIntervalId !== null || typeof window === 'undefined') {
    return
  }
  expiryIntervalId = window.setInterval(() => {
    currentTimeSnapshot = Date.now()
    for (const listener of expiryListeners) {
      listener()
    }
  }, EXPIRY_STATUS_TICK_MS)
}

function subscribeToExpiryTicker(listener: () => void): () => void {
  expiryListeners.add(listener)
  startExpiryTicker()
  return () => {
    expiryListeners.delete(listener)
    if (expiryListeners.size === 0 && expiryIntervalId !== null) {
      window.clearInterval(expiryIntervalId)
      expiryIntervalId = null
    }
  }
}

function getExpirySnapshot(): number {
  return currentTimeSnapshot
}

// Server snapshot must return a stable value - use 0 as a sentinel
// The actual time will be computed client-side after hydration
function getExpiryServerSnapshot(): number {
  return 0
}

function parseExpiryDate(expiryDate: unknown): Date | null {
  if (typeof expiryDate === 'string' && expiryDate) {
    const parsed = new Date(expiryDate)
    if (Number.isNaN(parsed.getTime())) {
      return null
    }
    return parsed
  }
  return null
}

interface ExpiryDateStatus {
  expiryDate: Date | null
  isExpired: boolean
  isExpiringSoon: boolean
}

export function useExpiryDateStatus(expiryDateRaw: unknown): ExpiryDateStatus {
  const expiryDate = React.useMemo(
    () => parseExpiryDate(expiryDateRaw),
    [expiryDateRaw]
  )

  const currentTime = React.useSyncExternalStore(
    subscribeToExpiryTicker,
    getExpirySnapshot,
    getExpiryServerSnapshot,
  )

  const { isExpired, isExpiringSoon } = React.useMemo(() => {
    if (!expiryDate) {
      return { isExpired: false, isExpiringSoon: false }
    }
    const expiryTime = expiryDate.getTime()
    return {
      isExpired: expiryTime < currentTime,
      isExpiringSoon: expiryTime - currentTime < THIRTY_DAYS_MS && expiryTime > currentTime,
    }
  }, [expiryDate, currentTime])

  return { expiryDate, isExpired, isExpiringSoon }
}
