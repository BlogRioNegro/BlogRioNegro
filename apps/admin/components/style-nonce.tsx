'use client'

import { setNonce } from 'get-nonce'

// SEC-006 · ADR 0020 · O Dialog do Radix (react-remove-scroll) injeta um <style> ao abrir; o
// get-nonce passa o nonce da CSP para ele. Renderizado antes do conteúdo, então roda antes de
// qualquer Dialog, no server e no client.
export function StyleNonce({ nonce }: { nonce: string }) {
  setNonce(nonce)
  return null
}
