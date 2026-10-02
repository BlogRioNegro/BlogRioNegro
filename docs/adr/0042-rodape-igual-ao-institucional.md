# 0042 · Rodapé do blog igual ao do site institucional

- Status: accepted · Data: 2026-10-01
- Specs: [PUB-013](../specs/03-public-site.md), [PUB-014](../specs/03-public-site.md)
- Supersedes parcialmente: [0018](0018-cta-e-disclaimer-no-rodape.md) (CTA no rodapé)

## Contexto
O rodapé do blog trazia só logotipo, CTA "Conheça a Rio Negro", disclaimer e link `/privacidade`.
O pedido é que ele seja igual ao de rionegroinvestimentos.com.br.

## Decisão
- Rodapé idêntico ao do institucional (referência: captura enviada pelo Rafael): fundo preto,
  logotipo branco, ícones circulares dourados (Facebook, Instagram, LinkedIn) e copyright à
  esquerda; telefone, "Ouvidoria XP", "Trabalhe conosco", "Política de privacidade" e disclaimer
  à direita. Altura ≈ 340 px no desktop.
- "Trabalhe conosco" e "Política de privacidade" apontam para o site institucional (nova aba).
- Preto e dourado entram como tokens `--color-footer-*` (export, `packages/ui` e spec 06, para manter
  a paridade de DS-003). O export do Claude Design foi estendido à mão: reaplicar no Claude Design
  para o próximo export não apagá-los. Sem escritórios nem WhatsApp, que não aparecem no rodapé
  de referência.
- O CTA "Conheça a Rio Negro" sai do rodapé e continua só na tela de sucesso do modal.
- `/privacidade` (LEAD-013) continua existindo e linkada pelo modal, mas não pelo rodapé.

## Consequências
- Brand icons não existem no `lucide-react` 1.x: SVGs locais em `apps/web/components/social-icons.tsx`.
