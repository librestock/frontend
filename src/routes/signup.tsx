import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { FormErrorBanner } from '@/components/common/FormErrorBanner'
import { useSignupForm } from '@/hooks/forms/use-signup-form'

export const Route = createFileRoute('/signup')({
  component: SignupRoute,
})

function SignupRoute(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const form = useSignupForm(async () => navigate({ to: '/login' }))

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <form
        className="bg-card text-card-foreground w-full max-w-sm space-y-4 rounded-lg border p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault()
          await form.handleSubmit()
        }}
      >
        <div>
          <h1 className="text-xl font-semibold">
            {t('auth.createAccount')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('auth.createAccountDescription')}
          </p>
        </div>

        <FormErrorBanner errors={form.state.errors} />

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('auth.name')}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  autoComplete="name"
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('auth.email')}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  autoComplete="email"
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('auth.password')}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  autoComplete="new-password"
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('auth.confirmPassword')}
              </FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  autoComplete="new-password"
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <button
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-3 py-2 disabled:opacity-60"
          disabled={form.state.isSubmitting}
          type="submit"
        >
          {form.state.isSubmitting
            ? t('auth.creatingAccount')
            : t('auth.createAccount')}
        </button>
        <p className="text-muted-foreground text-center text-sm">
          {t('auth.hasAccount')}{' '}
          <Link className="text-primary hover:underline" to="/login">
            {t('auth.signIn')}
          </Link>
        </p>
      </form>
    </div>
  )
}
