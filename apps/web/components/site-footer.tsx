import { Button } from '@rio-negro/ui'
import { ArrowRight } from '@rio-negro/ui/icons'
import Link from 'next/link'
import { env } from '@/lib/env'
import { Logo } from './logo'

// TODO(F4-009): trocar pelo disclaimer copiado do rodapé de rionegroinvestimentos.com.br.
const DISCLAIMER =
  'Texto provisório, sujeito à aprovação do compliance. A Rio Negro Assessoria de Investimentos Ltda. é uma assessoria de investimento registrada na Comissão de Valores Mobiliários (CVM), nos termos da Resolução CVM 178/23, e atua por meio de contrato de distribuição com a XP Investimentos CCTVM S.A. O conteúdo deste blog é informativo e não constitui oferta nem recomendação de investimento. Rentabilidade passada não garante rentabilidade futura.'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto flex max-w-(--layout-admin) flex-col gap-8 px-4 pt-12 pb-8 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo alt="Rio Negro Investimentos" />
          <Button asChild variant="link">
            <a href={env.NEXT_PUBLIC_RIO_NEGRO_URL} target="_blank" rel="noopener noreferrer">
              Conheça a Rio Negro
              <ArrowRight aria-hidden className="size-4" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </Button>
        </div>
        <p className="mb-3 text-xs leading-[1.6] text-text-muted">{DISCLAIMER}</p>
        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4 text-xs text-text-muted">
          <span>© {new Date().getFullYear()} Rio Negro Assessoria de Investimentos</span>
          <Link
            href="/privacidade"
            className="text-text underline underline-offset-3 hover:decoration-2"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
