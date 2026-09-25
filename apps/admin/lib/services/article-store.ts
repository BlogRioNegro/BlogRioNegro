import 'server-only'
import type { Database } from '@rio-negro/db'
import { logger } from './logger'
import type { AdminContext } from './require-admin'

type Supabase = AdminContext['supabase']
type Bucket = 'covers' | 'article-images' | 'article-previews' | 'article-files'

export type SaveArticleArgs = Database['public']['Functions']['save_article']['Args']

const EDIT_COLUMNS =
  'id, slug, title, summary, cover_path, content_type, preview_json, preview_pdf_path, published_at, article_contents(body_json, full_pdf_path)'

/** ADM-004 · Artigo com o conteúdo completo, para a edição (article_contents só o admin lê). */
export async function findArticleForEdit(supabase: Supabase, id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(EDIT_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    logger.error('admin.article_find_failed', { error })
    throw new Error('Falha ao carregar o artigo')
  }
  return data
}

export type ArticleForEdit = NonNullable<Awaited<ReturnType<typeof findArticleForEdit>>>

/** Artigo, conteúdo e histórico de slug numa transação (função save_article, sob RLS). */
export async function saveArticleRecord(supabase: Supabase, args: SaveArticleArgs) {
  const { error } = await supabase.rpc('save_article', args)
  return error
}

export async function uploadFile(supabase: Supabase, bucket: Bucket, path: string, file: Blob) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false })
  return error
}

/** Remove arquivos que deixaram de ser usados; falha só vai para o log. */
export async function removeFiles(supabase: Supabase, bucket: Bucket, paths: string[]) {
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(bucket).remove(paths)
  if (error) logger.warn('admin.storage_remove_failed', { bucket, error })
}
