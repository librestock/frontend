import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { signUp } from '@/lib/auth-client'

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSignupForm(onSuccess?: () => void | Promise<void>) {
  return useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
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
        const { error } = await signUp.email({
          email: value.email.trim(),
          password: value.password,
          name: value.name.trim(),
        })
        if (error) {
          return {
            form: 'Unable to create account. Please try again.',
          }
        }
        await onSuccess?.()
      } catch {
        return {
          form: 'Unable to create account. Please try again.',
        }
      }
      return undefined
    },
  })
}
