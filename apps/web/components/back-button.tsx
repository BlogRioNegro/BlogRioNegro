import { Button } from '@rio-negro/ui'
import Link from 'next/link'

// ADR 0047 · "Voltar" da lista e do artigo: link de verdade (funciona sem JavaScript), com o mesmo
// botão primário do "Ver artigos" da home, sem ícone.
export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild className="shrink-0">
      <Link href={href} aria-label={label}>
        Voltar
      </Link>
    </Button>
  )
}
