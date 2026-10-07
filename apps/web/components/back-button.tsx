import { Button } from '@rio-negro/ui'
import { ArrowLeft } from '@rio-negro/ui/icons'
import Link from 'next/link'

// ADR 0047 · "Voltar" da lista e do artigo: link de verdade (funciona sem JavaScript), em botão
// de contorno pequeno. O `after` estende a área de toque dos 36 px visíveis para 46 px (o inset
// conta a partir de dentro da borda de 1 px).
export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Button
      asChild
      variant="secondary"
      size="sm"
      className="relative shrink-0 after:absolute after:-inset-1.5"
    >
      <Link href={href} aria-label={label}>
        <ArrowLeft aria-hidden className="size-4" />
        Voltar
      </Link>
    </Button>
  )
}
