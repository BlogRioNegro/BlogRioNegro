import 'server-only'
import { z } from 'zod'

const required = z.string().min(1)

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: required,
  NEXT_PUBLIC_SITE_URL: z.url(),
  ADMIN_SITE_URL: z.url(),
  LEAD_WEBHOOK_URL: z.url().optional(),
  LEAD_WEBHOOK_SECRET: required.optional(),
})

function withoutEmptyValues(source: NodeJS.ProcessEnv) {
  return Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ''))
}

function parseEnv(source: NodeJS.ProcessEnv) {
  const result = schema.safeParse(withoutEmptyValues(source))
  if (result.success) return result.data

  const names = [...new Set(result.error.issues.map((issue) => issue.path.join('.')))]
  throw new Error(`Variáveis de ambiente ausentes ou inválidas: ${names.join(', ')}`)
}

export const env = parseEnv(process.env)
