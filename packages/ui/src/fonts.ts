import { Roboto, Roboto_Slab } from 'next/font/google'

// Fontes do guia da marca (DS-003, ADR 0043), servidas pelo próprio app (CSP font-src 'self').
// Sem `weight`: as duas são variáveis e cobrem os pesos dos tokens (300 a 700: o Bold dos títulos é o 700,
// ADR 0045).
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
