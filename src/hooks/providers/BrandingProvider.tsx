import { createContext, useContext, useMemo } from 'react'
import { useBrandingControllerGet, type BrandingResponseDto } from '@/lib/data/branding'

const DEFAULT_BRANDING: BrandingResponseDto = {
  app_name: 'LibreStock',
  tagline: 'Inventory management system',
  logo_url: null,
  favicon_url: null,
  primary_color: '#3b82f6',
  powered_by: {
    name: 'LibreStock',
    url: 'https://github.com/maximilianpw/librestock',
  },
  updated_at: new Date().toISOString(),
}

interface BrandingContextValue {
  branding: BrandingResponseDto
  isLoading: boolean
}

const BrandingContext = createContext<BrandingContextValue>({
  branding: DEFAULT_BRANDING,
  isLoading: true,
})

export function BrandingProvider({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { data, isLoading } = useBrandingControllerGet({
    query: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  })

  const value = useMemo<BrandingContextValue>(
    () => ({
      branding: data ?? DEFAULT_BRANDING,
      isLoading,
    }),
    [data, isLoading],
  )

  return <BrandingContext value={value}>{children}</BrandingContext>
}

export function useBranding(): BrandingContextValue {
  return useContext(BrandingContext)
}
