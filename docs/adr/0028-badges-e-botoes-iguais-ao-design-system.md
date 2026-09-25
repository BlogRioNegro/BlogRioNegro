# 0028 · Badges e botões iguais ao export do design system

- Status: accepted · Data: 2026-09-25
- Specs: [DS-004](../specs/06-design-system.md)

## Contexto
O `TypeBadge` de `packages/ui` saía branco com borda e ~26 px de altura em todos os formatos, e os
botões não tinham a borda transparente de 1 px do `rn-btn`, ficando 2 px mais estreitos que no
protótipo. A [ADR 0026](0026-ordem-da-pagina-do-artigo.md) tinha mantido o badge fora do protótipo.

## Decisão
- Badges seguem o `rn-badge` de `design/design-system/components/components.css`: 24 px de altura,
  borda transparente, PDF em `--color-surface-muted` sem borda, Texto em `--color-surface` com
  `--color-border`, status Desativado sem borda.
- `Button` tem borda transparente de 1 px em todas as variantes; o secundário usa
  `--color-border-strong` e escurece para `--color-text-muted` no hover.

## Consequências
- Badges e botões com as mesmas medidas do protótipo nos dois apps.
- Contraste do badge PDF registrado na spec 06 (13,70:1).
