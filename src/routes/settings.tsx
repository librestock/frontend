import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/auth-client'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { BrandingForm } from '@/components/settings/BrandingForm'
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
      throw redirect({ to: '/login' })
    }
  },
  component: SettingsPage,
})

function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="page-container space-y-6">
      <div className="page-header">
        <h1 className="text-xl font-semibold">
          {t('navigation.settings') || 'Settings'}
        </h1>
      </div>

      <div className="grid gap-6">
        <BrandingForm />

        <Card>
          <CardHeader>
            <CardTitle>
              {t('settings.appearance') || 'Appearance'}
            </CardTitle>
            <CardDescription>
              {t('settings.appearanceDescription') ||
                'Customize the look and feel of the application'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {t('settings.theme') || 'Theme'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.themeDescription') ||
                    'Switch between light and dark mode'}
                </p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {t('settings.language') || 'Language'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.languageDescription') ||
                    'Choose your preferred language'}
                </p>
              </div>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
