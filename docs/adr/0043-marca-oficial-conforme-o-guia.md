# 0043 · Marca oficial conforme o guia

- Status: accepted · Data: 2026-10-02 · superseded em parte por
  [0044](0044-tipografia-e-favicon-do-site-institucional.md) (peso dos títulos e favicon)
- Specs: [DS-001, DS-003](../specs/06-design-system.md), [PUB-013](../specs/03-public-site.md)
- Supersedes: [0038](0038-staycloud-deploy-pro-node-22.md) (hospedagem) e, em parte,
  [0042](0042-rodape-igual-ao-institucional.md) (cores do rodapé) e
  [0023](0023-tokens-por-export-do-claude-design.md) (famílias de fonte)

## Contexto
A Rio Negro entregou o guia oficial da marca "Rio Negro Investimentos | XP"
([design/marca/INFO-RN-XP.pdf](../../design/marca/INFO-RN-XP.pdf), 1 página). O blog usava um cinza
quente próprio, Inter e Source Serif 4, logos de 256×42 e nenhum favicon.

## Decisão
O site continua claro. Nenhum elemento visual novo: só recoloração, tipografia, logo e favicon.

**Cores (hex exato do guia)**

| Cor do guia | Token | Papel |
|---|---|---|
| Principal `#101820` | `--rn-navy-900` | `--color-text`, `--color-action-primary`, `--color-focus-ring`, `--color-footer-bg` |
| Secundária `#bc955c` | `--rn-gold-500` | `--color-divider` (linha do header nos dois apps, separadores da página do artigo e do modal de lead, barra de citação) e `--color-footer-accent` (ícones do rodapé) |
| Apoio `#ffcb05` | `--rn-yellow-500` | `--color-highlight`: só token. O selo de destaque não existe no site |
| Degradê `#4c4c4c` → `#101820` | `--rn-gray-700`, `--gradient-brand` | Só token: não aplicado em nenhuma tela |

- Contraste (WCAG 2.1): `#101820` sobre branco 17,89:1 e sobre `--color-bg` 15,75:1. O dourado sobre
  fundo claro dá 2,77:1 (2,43:1 sobre bg): por isso nunca é texto nem identifica controle, só
  divisória decorativa. No rodapé, dourado sobre `#101820` dá 6,47:1. Amarelo sob texto `#101820`: 11,76:1.
- `--color-footer-accent-hover` é derivado: `color-mix` de 80% do dourado com o branco do rodapé.

**Fontes** (via `next/font/google`, servidas pelo próprio app)
- Roboto Slab Black (900): títulos (`h1`–`h3`, títulos de card e do modal).
- Roboto Slab Regular (400): subtítulos (resumo do artigo, linha de apoio do hero, das páginas de
  erro, do modal e dos títulos do admin).
- Roboto: todo o resto (corpo do artigo, interface, textos jurídicos).
- Os links do rodapé seguem em Roboto Slab 400, como no site institucional (ADR 0042).

**Logo e favicon**: recortados do PDF renderizado em escala 4 (pdf.js), em PNG transparente.
Logo escura 1024×169 e branca 906×153; mesmo desenho das anteriores, mais nítidas e na cor do guia.
Favicon "RN" branco sobre `#101820`, 512×512, em `app/icon.png` nos dois apps.

**Fora do guia** (ficam como estavam): paleta `--rn-warm-*` (fundos, superfícies, bordas, texto
secundário, hover da ação primária), cores de sucesso, erro e aviso, `--color-overlay` e as sombras
(ainda derivadas de `#1d1c1b`), raios, espaçamento e escala tipográfica.

**Erros de digitação do PDF**: o fim do degradê está rotulado `#1a3544` (R26 G53 B68), mas a cor
pintada é `#101820`; vale a cor pintada.

**Hospedagem**: produção na Vercel (blog em https://blogrionegro.vercel.app e um projeto separado
para o admin), com deploy automático a cada push na `main`. A ADR 0038 (StayCloud) não vale mais.

## Consequências
- Os tokens novos foram acrescentados à mão no export em `design/design-system/tokens/`: reaplicar
  no Claude Design, ou o próximo export os apaga.
- No admin, `/icon.png` é público no `proxy.ts`, para o favicon abrir na tela de login.
- `design/prototipo/` e o PDF gerado dos artigos (`article-pdf.tsx`) não mudam: seguem com a
  identidade anterior.
