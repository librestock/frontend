import { describe, expect, it } from 'vitest'
import { Permission, Resource } from '@librestock/types'
import { canAccess } from './permissions'

describe('canAccess', () => {
  it('returns false when permissions are missing', () => {
    expect(canAccess(undefined, Permission.READ, Resource.USERS)).toBe(false)
    expect(canAccess(null, Permission.READ, Resource.USERS)).toBe(false)
  })

  it('returns true when the requested permission exists on the resource', () => {
    const permissions = {
      [Resource.USERS]: [Permission.READ],
    }

    expect(canAccess(permissions, Permission.READ, Resource.USERS)).toBe(true)
  })

  it('returns false when the permission does not exist on the resource', () => {
    const permissions = {
      [Resource.USERS]: [Permission.READ],
    }

    expect(canAccess(permissions, Permission.WRITE, Resource.USERS)).toBe(false)
  })

  it('returns false when the resource key is absent', () => {
    const permissions = {
      [Resource.DASHBOARD]: [Permission.READ],
    }

    expect(canAccess(permissions, Permission.READ, Resource.USERS)).toBe(false)
  })
})
