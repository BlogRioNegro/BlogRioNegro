import { fontVariables } from '@rio-negro/ui/fonts'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rio Negro Investimentos',
}

// O SiteHeader fica em cada segmento, porque o link ativo muda com a rota e o layout raiz
// não re-renderiza na navegação.
export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection()

  return (
    <html lang="pt-BR" className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
