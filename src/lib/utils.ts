import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'
import type { CategoryWithChildrenResponseDto } from './data/categories'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes a URL to prevent XSS via javascript: or data: URIs.
 * Returns the URL if it uses http, https, or is a relative path.
 * Returns an empty string for dangerous protocols.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed === '') return ''

  // Allow relative URLs (starting with / or .)
  if (trimmed.startsWith('/') || trimmed.startsWith('.')) return trimmed

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed
    }
    return ''
  } catch {
    // If it can't be parsed as an absolute URL, treat it as a relative path
    // but reject anything that looks like a protocol
    if (/^[a-z]+:/i.test(trimmed)) return ''
    return trimmed
  }
}

export function isValidCategoryId(
  categories: CategoryWithChildrenResponseDto[],
  categoryId: string,
): boolean {
  if (categoryId === '') return false
  const stack: CategoryWithChildrenResponseDto[] = [...categories]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    if (current.id === categoryId) return true
    if (current.children.length > 0) {
      stack.push(...current.children)
    }
  }

  return false
}
