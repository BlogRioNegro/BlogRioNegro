import { Button } from '@rio-negro/ui'
import { ArrowRight } from '@rio-negro/ui/icons'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

// PUB-001 · Hero fixo no código, sem consulta ao banco.
export default function HomePage() {
  return (
    <>
      <SiteHeader home />
      <main className="mx-auto flex w-full max-w-(--layout-admin) flex-1 flex-col justify-center px-4 py-16 md:px-6 md:py-24">
        <div className="flex max-w-[680px] flex-col items-start gap-6">
          <h1 className="font-serif text-h1 font-black text-balance">
            Artigos, estudos e relatórios elaborados por nosso time de assessores e especialistas.
          </h1>
          <p className="font-serif text-md leading-normal font-regular text-text-muted md:max-w-[60ch] md:text-lg">
            Artigos e estudos para ajudar você a entender o mercado e decidir com mais informação.
          </p>
          <Button asChild className="w-full md:w-auto">
            <Link href="/artigos">
              Ver artigos
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </Button>
        </div>
      </main>
    </>
  )
}
