import Link from 'next/link'
import { BackLink } from './back-link'
import { Logo } from './logo'

const MENU_ITEM = 'text-sm font-light uppercase underline-offset-6 hover:underline'

// ADR 0047 · Na home o item do menu é "Artigos"; nas demais páginas, "Voltar" (44 px de toque).
export function SiteHeader({ home = false }: { home?: boolean }) {
  return (
    <header className="border-b border-divider bg-bg">
      <div className="mx-auto flex h-16 max-w-(--layout-admin) items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" aria-label="Rio Negro Investimentos, página inicial" className="flex">
          <Logo alt="" />
        </Link>
        <nav aria-label="Principal" className="flex gap-6">
          {home ? (
            <Link href="/artigos" className={`py-2 ${MENU_ITEM}`}>
              Artigos
            </Link>
          ) : (
            <BackLink className={`py-2.5 ${MENU_ITEM}`} />
          )}
        </nav>
      </div>
    </header>
  )
}
