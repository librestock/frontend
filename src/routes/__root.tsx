import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'
import {
  BrandingProvider,
  useBranding,
} from '@/hooks/providers/BrandingProvider'
import { I18nProvider } from '@/hooks/providers/I18nProvider'
import { ThemeProvider } from '@/hooks/providers/ThemeProvider'
import { Theme } from '@/lib/enums/theme.enum'
import type { RouterContext } from '@/lib/router/context'
import { sanitizeUrl } from '@/lib/utils'

// eslint-disable-next-line import/order
import appCss from './globals.css?url'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import { NotFound } from '@/components/NotFound'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => NotFound,
})

function RootComponent(): React.JSX.Element {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function DynamicHead(): React.JSX.Element {
  const { branding } = useBranding()

  return (
    <div>
      <title>{branding.app_name}</title>
      <meta content={branding.tagline} name="description" />
      <meta content={branding.app_name} name="apple-mobile-web-app-title" />
      <link
        href={sanitizeUrl(branding.favicon_url) || '/icons/icon-192x192.png'}
        rel="icon"
      />
      <link
        href={sanitizeUrl(branding.favicon_url) || '/icons/apple-touch-icon.png'}
        rel="apple-touch-icon"
      />
    </div>
  )
}

function RootDocument({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <BrandingProvider>
          <DynamicHead />
          <I18nProvider>
            <ThemeProvider
              disableTransitionOnChange
              enableSystem
              attribute="class"
              defaultTheme={Theme.SYSTEM}
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </I18nProvider>
        </BrandingProvider>
        <Scripts />
      </body>
    </html>
  )
}
