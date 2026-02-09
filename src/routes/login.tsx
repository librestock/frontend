import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { FormErrorBanner } from '@/components/common/FormErrorBanner'
import { useLoginForm } from '@/hooks/forms/use-login-form'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute(): React.JSX.Element {
  const navigate = useNavigate()
  const form = useLoginForm(async () => navigate({ to: '/' }))

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
          <h1 className="text-xl font-semibold">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Use your account email and password.
          </p>
        </div>

        <FormErrorBanner errors={form.state.errors} />

        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
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
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <FieldContent>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  autoComplete="current-password"
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
          {form.state.isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link className="text-primary hover:underline" to="/signup">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  )
}
