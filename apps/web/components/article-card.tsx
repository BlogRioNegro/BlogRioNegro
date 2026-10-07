import Link from 'next/link'
import type { ArticleCardData } from '@/lib/services/articles'
import { CoverImage } from './cover-image'

// PUB-003 · O card inteiro é o link: capa, data, título (até 3 linhas) e subtítulo, se houver.
export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/artigos/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-colors duration-(--duration-fast) hover:border-border-strong"
    >
      <CoverImage src={article.coverUrl} />
      <div className="flex flex-col gap-2 p-4">
        <time dateTime={article.publishedAt} className="text-xs text-text-muted">
          {article.dateLabel}
        </time>
        <h2 className="line-clamp-3 font-serif text-md leading-snug font-black text-pretty wrap-break-word hyphens-auto underline-offset-4 group-hover:underline">
          {article.title}
        </h2>
        {article.subtitle ? (
          <p className="-mt-1 font-serif text-sm font-regular text-pretty wrap-break-word">
            {article.subtitle}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
