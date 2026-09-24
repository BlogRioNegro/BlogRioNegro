import type { Metadata } from 'next'
import { connection } from 'next/server'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Rio Negro · Admin',
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection()

  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
