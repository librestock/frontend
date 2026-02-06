import { z } from 'zod'

const schema = z.object({
  VITE_API_BASE_URL: z.string().url(),
})

const result = schema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
})

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = result.data
