import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { signIn } from '@/lib/auth-client'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLoginForm(onSuccess?: () => void | Promise<void>) {
  return useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = formSchema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const { error } = await signIn.email({
          email: value.email.trim(),
          password: value.password,
        })
        if (error) {
          return {
            form: 'Unable to sign in. Check your credentials and try again.',
          }
        }
        await onSuccess?.()
      } catch {
        return {
          form: 'Unable to sign in. Check your credentials and try again.',
        }
      }
      return undefined
    },
  })
}
