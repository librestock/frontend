import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { toast } from 'sonner'

import { FormErrorBanner } from '@/components/common/FormErrorBanner'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  useBrandingControllerGet,
  useBrandingControllerUpdate,
  getBrandingControllerGetQueryKey,
} from '@/lib/data/branding'

const safeUrlSchema = z
  .string()
  .max(500)
  .refine(
    (val) => {
      if (!val) return true
      // Allow relative URLs
      if (val.startsWith('/') || val.startsWith('.')) return true
      try {
        const parsed = new URL(val)
        return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      } catch {
        // Reject anything that looks like a dangerous protocol
        return !/^[a-z]+:/i.test(val)
      }
    },
    { message: 'Must be a valid URL (https://, http://, or relative path)' },
  )

const brandingSchema = z.object({
  app_name: z.string().min(1, 'App name is required').max(100),
  tagline: z.string().max(255),
  logo_url: safeUrlSchema,
  favicon_url: safeUrlSchema,
  primary_color: z
    .string()
    .regex(/^#[\dA-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #3b82f6)'),
})

export function BrandingForm(): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: branding, isLoading } = useBrandingControllerGet()
  const updateMutation = useBrandingControllerUpdate()

  const form = useForm({
    defaultValues: {
      app_name: branding?.app_name ?? 'LibreStock',
      tagline: branding?.tagline ?? '',
      logo_url: String(branding?.logo_url ?? ''),
      favicon_url: String(branding?.favicon_url ?? ''),
      primary_color: branding?.primary_color ?? '#3b82f6',
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = brandingSchema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          data: {
            app_name: value.app_name,
            tagline: value.tagline || undefined,
            logo_url: value.logo_url || undefined,
            favicon_url: value.favicon_url || undefined,
            primary_color: value.primary_color || undefined,
          } as Parameters<typeof updateMutation.mutateAsync>[0]['data'],
        })
        await queryClient.invalidateQueries({
          queryKey: getBrandingControllerGetQueryKey(),
        })
        toast.success(t('settings.brandingSaved') || 'Branding settings saved')
      } catch {
        toast.error(
          t('settings.brandingError') || 'Failed to save branding settings',
        )
      }
    },
  })

  React.useEffect(() => {
    if (branding) {
      form.setFieldValue('app_name', branding.app_name)
      form.setFieldValue('tagline', branding.tagline)
      form.setFieldValue('logo_url', String(branding.logo_url ?? ''))
      form.setFieldValue('favicon_url', String(branding.favicon_url ?? ''))
      form.setFieldValue('primary_color', branding.primary_color)
    }
  }, [branding, form])

  if (isLoading) {
    return <div className="bg-muted h-64 animate-pulse rounded-lg" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.branding') || 'Branding'}</CardTitle>
        <CardDescription>
          {t('settings.brandingDescription') ||
            'Customize how your inventory system appears to users'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await form.handleSubmit()
          }}
        >
          <FormErrorBanner errors={form.state.errors} />

          <FieldGroup>
            <form.Field name="app_name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('settings.appName') || 'Application Name'}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      aria-invalid={field.state.meta.errors.length > 0}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldDescription>
                      {t('settings.appNameDescription') ||
                        'Displayed in the header, browser tab, and login screen'}
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )}
            </form.Field>

            <form.Field name="tagline">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('settings.tagline') || 'Tagline'}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      aria-invalid={field.state.meta.errors.length > 0}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldDescription>
                      {t('settings.taglineDescription') ||
                        'A short description shown in the browser meta tags'}
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )}
            </form.Field>

            <form.Field name="logo_url">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('settings.logoUrl') || 'Logo URL'}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      aria-invalid={field.state.meta.errors.length > 0}
                      id={field.name}
                      name={field.name}
                      placeholder="/uploads/logo.png"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldDescription>
                      {t('settings.logoUrlDescription') ||
                        'URL to your logo image (displayed in the sidebar)'}
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )}
            </form.Field>

            <form.Field name="favicon_url">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('settings.faviconUrl') || 'Favicon URL'}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      aria-invalid={field.state.meta.errors.length > 0}
                      id={field.name}
                      name={field.name}
                      placeholder="/icons/favicon.png"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldDescription>
                      {t('settings.faviconUrlDescription') ||
                        'URL to your favicon (browser tab icon)'}
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )}
            </form.Field>

            <form.Field name="primary_color">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('settings.primaryColor') || 'Primary Color'}
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <input
                        className="h-10 w-14 cursor-pointer rounded border-0 p-1"
                        id={`${field.name}-picker`}
                        type="color"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <Input
                        aria-invalid={field.state.meta.errors.length > 0}
                        className="flex-1"
                        id={field.name}
                        name={field.name}
                        placeholder="#3b82f6"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                    <FieldDescription>
                      {t('settings.primaryColorDescription') ||
                        'Main brand color used throughout the interface'}
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <div className="mt-6 flex justify-end">
            <Button disabled={updateMutation.isPending} type="submit">
              {updateMutation.isPending
                ? t('common.saving') || 'Saving...'
                : t('common.save') || 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
