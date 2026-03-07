import { describe, expect, it } from 'vitest'
import type { CategoryWithChildrenResponseDto } from './data/categories'
import { isValidCategoryId, sanitizeUrl } from './utils'

describe('sanitizeUrl', () => {
  it('allows safe absolute and relative URLs', () => {
    expect(sanitizeUrl('https://example.com/logo.png')).toBe(
      'https://example.com/logo.png',
    )
    expect(sanitizeUrl('/assets/logo.png')).toBe('/assets/logo.png')
    expect(sanitizeUrl('./relative/path')).toBe('./relative/path')
  })

  it('rejects dangerous protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeUrl('data:text/html;base64,abcd')).toBe('')
  })

  it('handles empty and invalid inputs', () => {
    expect(sanitizeUrl(undefined)).toBe('')
    expect(sanitizeUrl(null)).toBe('')
    expect(sanitizeUrl('   ')).toBe('')
  })
})

describe('isValidCategoryId', () => {
  const categories: CategoryWithChildrenResponseDto[] = [
    {
      id: 'root',
      name: 'Root',
      children: [
        {
          id: 'child',
          name: 'Child',
          children: [],
        },
      ],
    } as CategoryWithChildrenResponseDto,
  ]

  it('returns true for direct and nested category ids', () => {
    expect(isValidCategoryId(categories, 'root')).toBe(true)
    expect(isValidCategoryId(categories, 'child')).toBe(true)
  })

  it('returns false for empty and unknown ids', () => {
    expect(isValidCategoryId(categories, '')).toBe(false)
    expect(isValidCategoryId(categories, 'missing')).toBe(false)
  })
})
