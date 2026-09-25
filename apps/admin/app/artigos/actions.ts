'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { publishedAtFromDate } from '../../lib/domain/admin-date'
import {
  ARTICLE_MESSAGES,
  articleFieldsFrom,
  articleFieldsSchema,
  fieldErrorsOf,
  fileFrom,
  type ArticleFields,
  type FieldErrors,
} from '../../lib/domain/article-form'
import { checkRichText, parseBodyField } from '../../lib/domain/rich-text'
import { failAction, type ActionResult } from '../../lib/services/action-result'
import {
  findArticleForEdit,
  publicFileUrl,
  removeFiles,
  saveArticleRecord,
  uploadFile,
  type ArticleForEdit,
  type SaveArticleArgs,
} from '../../lib/services/article-store'
import { requireAdmin } from '../../lib/services/require-admin'
import { validateUpload } from '../../lib/services/upload'

export type SaveArticleState = { ok: false; error: string; fieldErrors: FieldErrors } | null

const INVALID_FORM_MESSAGE = 'Confira os campos destacados.'

type ContentValues = Pick<
  SaveArticleArgs,
  'preview_json' | 'preview_pdf_path' | 'body_json' | 'full_pdf_path'
>

// ADM-005 · Imagens do rich text só do bucket article-images, na pasta do próprio artigo.
function articleImagesPrefix(supabase: Parameters<typeof publicFileUrl>[0], articleId: string) {
  return publicFileUrl(supabase, 'article-images', `${articleId}/`)
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
  const coverFile = fileFrom(formData, 'cover')
  const cover = coverFile ? await validateUpload('covers', coverFile) : null
  const body = formData.get('body')
  const richText =
    fields.contentType === 'rich_text' && body !== null
      ? checkRichText(parseBodyField(body), articleImagesPrefix(auth.supabase, fields.id))
      : null
  const content = richText ? null : keptContent(existing, fields.contentType)

  const fieldErrors: FieldErrors = {}
  if (!existing && !cover) fieldErrors.cover = ARTICLE_MESSAGES.cover
  if (cover && !cover.ok) fieldErrors.cover = cover.error
  if (richText && !richText.ok) fieldErrors.content = richText.error
  else if (!content)
    fieldErrors.content =
      fields.contentType === 'pdf' ? ARTICLE_MESSAGES.pdf : ARTICLE_MESSAGES.richText
  if (Object.keys(fieldErrors).length > 0 || !content || (cover && !cover.ok))
    return invalid(fieldErrors)

  const newCoverPath = cover ? `${fields.id}/${randomUUID()}.${cover.extension}` : null
  if (cover && newCoverPath) {
    const uploadError = await uploadFile(auth.supabase, 'covers', newCoverPath, cover.file)
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

const IMAGE_MISSING_MESSAGE = 'Escolha uma imagem JPG, PNG ou WebP.'

export type UploadedImage = ActionResult<{ src: string }>

/** ADM-005 · ADM-006 · Imagem inline do editor: validada e enviada para article-images. */
export async function uploadArticleImage(formData: FormData): Promise<UploadedImage> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const articleId = z.uuid().safeParse(formData.get('articleId'))
  const file = fileFrom(formData, 'image')
  if (!articleId.success || !file) return { ok: false, error: IMAGE_MISSING_MESSAGE }

  const image = await validateUpload('article-images', file)
  if (!image.ok) return image

  const path = `${articleId.data}/${randomUUID()}.${image.extension}`
  const uploadError = await uploadFile(auth.supabase, 'article-images', path, image.file)
  if (uploadError) return failAction('admin.image_upload_failed', uploadError)

  return { ok: true, data: { src: publicFileUrl(auth.supabase, 'article-images', path) } }
}
