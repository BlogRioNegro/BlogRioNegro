'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type MouseEvent } from 'react'
import { backFallback, canGoBack, nextTrail } from '@/lib/domain/back-navigation'

// ADR 0047 · Trilha das telas desta visita, só em memória: some ao recarregar a página.
let trail: string[] = []
let viaHistory = false

/** Acompanha as mudanças de rota. Fica no layout raiz, que não desmonta na navegação. */
export function NavigationTrail() {
  const pathname = usePathname()

  useEffect(() => {
    const markHistory = () => {
      viaHistory = true
    }
    window.addEventListener('popstate', markHistory)
    return () => window.removeEventListener('popstate', markHistory)
  }, [])

  useEffect(() => {
    trail = nextTrail(trail, pathname, viaHistory)
    viaHistory = false
  }, [pathname])

  return null
}

/**
 * "Voltar" do menu: um link para o nível acima, que funciona sem JavaScript. Com JavaScript, se a
 * pessoa já navegou dentro do blog, o clique volta para a tela anterior.
 */
export function BackLink({ className }: { className?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const newTab = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
    if (newTab || event.button !== 0 || !canGoBack(trail)) return
    event.preventDefault()
    router.back()
  }

  return (
    <Link
      href={backFallback(pathname)}
      aria-label="Voltar para a página anterior"
      onClick={handleClick}
      className={className}
    >
      Voltar
    </Link>
  )
}
