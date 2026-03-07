import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useExpiryDateStatus } from './useExpiryDateStatus'

afterEach(() => {
  cleanup()
})

describe('useExpiryDateStatus', () => {
  it('returns neutral state for invalid expiry input', () => {
    const { result } = renderHook(() => useExpiryDateStatus('not-a-date'))

    expect(result.current.expiryDate).toBeNull()
    expect(result.current.isExpired).toBe(false)
    expect(result.current.isExpiringSoon).toBe(false)
  })

  it('marks past dates as expired', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { result } = renderHook(() => useExpiryDateStatus(pastDate))

    expect(result.current.expiryDate).not.toBeNull()
    expect(result.current.isExpired).toBe(true)
    expect(result.current.isExpiringSoon).toBe(false)
  })

  it('marks dates within 30 days as expiring soon', () => {
    const soonDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    const { result } = renderHook(() => useExpiryDateStatus(soonDate))

    expect(result.current.isExpired).toBe(false)
    expect(result.current.isExpiringSoon).toBe(true)
  })

  it('does not mark dates beyond 30 days as expiring soon', () => {
    const farDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
    const { result } = renderHook(() => useExpiryDateStatus(farDate))

    expect(result.current.isExpired).toBe(false)
    expect(result.current.isExpiringSoon).toBe(false)
  })
})
