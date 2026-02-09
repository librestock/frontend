import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getSession, signOut } from '@/lib/auth-client'

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { BrandingForm } from '@/components/settings/BrandingForm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    const { data: session } = await getSession()
    if (!session) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' })
    }
  },
  component: SettingsPage,
})

function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true)
    try {
      await signOut()
      await navigate({ to: '/login' })
    } catch {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="text-xl font-semibold">
          {t('navigation.settings')}
        </h1>
      </div>

      <div className="grid gap-6 overflow-auto p-6">
        <BrandingForm />

        <Card>
          <CardHeader>
            <CardTitle>
              {t('settings.appearance')}
            </CardTitle>
            <CardDescription>
              {t('settings.appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {t('settings.theme')}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('settings.themeDescription')}
                </p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {t('settings.language')}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('settings.languageDescription')}
                </p>
              </div>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('settings.account')}
            </CardTitle>
            <CardDescription>
              {t('settings.accountDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {t('auth.signOut')}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t('auth.signOutDescription')}
                </p>
              </div>
              <Button
                disabled={isSigningOut}
                variant="destructive"
                onClick={handleSignOut}
              >
                {isSigningOut ? t('auth.signingOut') : t('auth.signOut')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
