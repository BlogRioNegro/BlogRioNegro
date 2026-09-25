'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { publishedAtFromDate } from '../../lib/domain/admin-date'
import {
  ARTICLE_MESSAGES,
  articleFieldsFrom,
  articleFieldsSchema,
  fieldErrorsOf,
  type ArticleFields,
  type FieldErrors,
} from '../../lib/domain/article-form'
import { failAction } from '../../lib/services/action-result'
import {
  findArticleForEdit,
  removeFiles,
  saveArticleRecord,
  uploadFile,
  type ArticleForEdit,
  type SaveArticleArgs,
} from '../../lib/services/article-store'
import { requireAdmin } from '../../lib/services/require-admin'

export type SaveArticleState = { ok: false; error: string; fieldErrors: FieldErrors } | null

const INVALID_FORM_MESSAGE = 'Confira os campos destacados.'

const COVER_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

type ContentValues = Pick<
  SaveArticleArgs,
  'preview_json' | 'preview_pdf_path' | 'body_json' | 'full_pdf_path'
>

function fileFrom(formData: FormData, name: string): File | null {
  const value = formData.get(name)
  return value instanceof File && value.size > 0 ? value : null
}

function invalid(fieldErrors: FieldErrors): SaveArticleState {
  return { ok: false, error: INVALID_FORM_MESSAGE, fieldErrors }
}

// Conteúdo atual do artigo, reaproveitado quando o tipo não mudou e nada novo foi enviado.
function keptContent(
  existing: ArticleForEdit | null,
  contentType: ArticleFields['contentType'],
): ContentValues | null {
  const contents = existing?.article_contents
  if (!existing || !contents || existing.content_type !== contentType) return null
  return {
    preview_json: existing.preview_json ?? undefined,
    preview_pdf_path: existing.preview_pdf_path ?? undefined,
    body_json: contents.body_json ?? undefined,
    full_pdf_path: contents.full_pdf_path,
  }
}

/** ADM-004 · Salvar = publicar (ADR 0005). Valida com o mesmo schema do form. */
export async function saveArticle(
  _previous: SaveArticleState,
  formData: FormData,
): Promise<SaveArticleState> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ...auth, fieldErrors: {} }

  const parsed = articleFieldsSchema.safeParse(articleFieldsFrom(formData))
  if (!parsed.success) return invalid(fieldErrorsOf(parsed.error))
  const fields = parsed.data

  const existing = await findArticleForEdit(auth.supabase, fields.id)
  const cover = fileFrom(formData, 'cover')
  const coverExtension = cover ? COVER_EXTENSIONS[cover.type] : undefined
  const content = keptContent(existing, fields.contentType)

  const fieldErrors: FieldErrors = {}
  if (!existing && !cover) fieldErrors.cover = ARTICLE_MESSAGES.cover
  if (cover && !coverExtension) fieldErrors.cover = ARTICLE_MESSAGES.cover
  if (!content)
    fieldErrors.content =
      fields.contentType === 'pdf' ? ARTICLE_MESSAGES.pdf : ARTICLE_MESSAGES.richText
  if (Object.keys(fieldErrors).length > 0 || !content) return invalid(fieldErrors)

  const newCoverPath = cover ? `${fields.id}/${randomUUID()}.${coverExtension}` : null
  if (cover && newCoverPath) {
    const uploadError = await uploadFile(auth.supabase, 'covers', newCoverPath, cover)
    if (uploadError) return { ...failAction('admin.cover_upload_failed', uploadError), fieldErrors }
  }

  const coverPath = newCoverPath ?? existing?.cover_path
  if (!coverPath) return invalid({ cover: ARTICLE_MESSAGES.cover })

  const saveError = await saveArticleRecord(auth.supabase, {
    article_id: fields.id,
    slug: fields.slug,
    title: fields.title,
    summary: fields.summary ?? undefined,
    cover_path: coverPath,
    content_type: fields.contentType,
    published_at: publishedAtFromDate(
      fields.publishedDate,
      existing?.published_at ?? null,
      new Date(),
    ),
    ...content,
  })
  if (saveError) {
    if (newCoverPath) await removeFiles(auth.supabase, 'covers', [newCoverPath])
    return { ...failAction('admin.article_save_failed', saveError), fieldErrors }
  }

  if (newCoverPath && existing) await removeFiles(auth.supabase, 'covers', [existing.cover_path])
  redirect('/artigos')
}
