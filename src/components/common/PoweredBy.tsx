import { useBranding } from '@/hooks/providers/BrandingProvider'
import { sanitizeUrl } from '@/lib/utils'

export function PoweredBy(): React.JSX.Element {
  const { branding } = useBranding()
  const safeUrl = sanitizeUrl(branding.powered_by.url)

  return (
    <div className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground">
      <span>Powered by</span>
      {safeUrl ? (
        <a
          className="font-medium underline-offset-4 hover:underline"
          href={safeUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {branding.powered_by.name}
        </a>
      ) : (
        <span className="font-medium">{branding.powered_by.name}</span>
      )}
    </div>
  )
}
