import { Roboto, Roboto_Slab } from 'next/font/google'

// Fontes do guia da marca (DS-003, ADR 0043), servidas pelo próprio app (CSP font-src 'self').
const roboto = Roboto({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-roboto',
  display: 'swap',
})

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  display: 'swap',
})

export const fontVariables = `${roboto.variable} ${robotoSlab.variable}`
