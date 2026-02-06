import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { signUp } from '@/lib/auth-client'

export const Route = createFileRoute('/signup')({
  component: SignupRoute,
})

function SignupRoute(): React.JSX.Element {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error: signUpError } = await signUp.email({
        email,
        password,
        name,
      })
      if (signUpError) {
        setError('Unable to create account. Please try again.')
        return
      }
      await navigate({ to: '/login' })
    } catch {
      setError('Unable to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <h1 className="text-xl font-semibold">Create Account</h1>
          <p className="text-muted-foreground text-sm">
            Enter your details to create a new account.
          </p>
        </div>
        <label className="block space-y-1 text-sm">
          <span>Name</span>
          <input
            required
            autoComplete="name"
            className="w-full rounded-md border px-3 py-2"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Email</span>
          <input
            required
            autoComplete="email"
            className="w-full rounded-md border px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Password</span>
          <input
            required
            autoComplete="new-password"
            className="w-full rounded-md border px-3 py-2"
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Confirm Password</span>
          <input
            required
            autoComplete="new-password"
            className="w-full rounded-md border px-3 py-2"
            minLength={8}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        {error ? (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        ) : null}
        <button
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-3 py-2 disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link className="text-primary hover:underline" to="/login">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  )
}
