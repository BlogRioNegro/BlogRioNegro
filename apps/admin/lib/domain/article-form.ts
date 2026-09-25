import { z } from 'zod'

// ADM-004 · Schema único dos campos de texto do formulário de artigo: o form (client) e a
// Server Action (server) validam com ele. Limites de DATA-001.

export const ARTICLE_MESSAGES = {
  title: 'Informe um título de 3 a 160 caracteres.',
  slug: 'Use só letras minúsculas sem acento, números e hífens (até 120 caracteres).',
  summary: 'O resumo tem no máximo 160 caracteres.',
  publishedDate: 'Informe a data de publicação.',
  cover: 'Envie a capa do artigo.',
  pdf: 'Envie o arquivo PDF.',
  richText: 'Escreva o conteúdo do artigo.',
} as const

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const articleFieldsSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(3, ARTICLE_MESSAGES.title).max(160, ARTICLE_MESSAGES.title),
  slug: z
    .string()
    .trim()
    .max(120, ARTICLE_MESSAGES.slug)
    .regex(SLUG_PATTERN, ARTICLE_MESSAGES.slug),
  summary: z
    .string()
    .trim()
    .max(160, ARTICLE_MESSAGES.summary)
    .transform((summary) => summary || null),
  contentType: z.enum(['pdf', 'rich_text']),
  publishedDate: z.iso.date(ARTICLE_MESSAGES.publishedDate),
})

export type ArticleFields = z.infer<typeof articleFieldsSchema>

export type ArticleField = Exclude<keyof ArticleFields, 'id'> | 'cover' | 'content'

export type FieldErrors = Partial<Record<ArticleField, string>>

const TEXT_FIELDS = ['title', 'slug', 'summary', 'contentType', 'publishedDate'] as const

/** Valores crus do FormData para o schema (campo ausente vira string vazia). */
export function articleFieldsFrom(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    ['id', ...TEXT_FIELDS].map((name) => {
      const value = formData.get(name)
      return [name, typeof value === 'string' ? value : '']
    }),
  )
}

/** Primeira mensagem de cada campo que falhou. */
export function fieldErrorsOf(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    const known = TEXT_FIELDS.find((name) => name === field)
    if (known && !errors[known]) errors[known] = issue.message
  }
  return errors
}
