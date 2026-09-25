# 0038 · Deploy num VPS da StayCloud com Node 22 LTS

- Status: accepted · Data: 2026-09-25
- Specs: [OVW-004](../specs/00-overview.md)
- Complementa: [ADR 0002](0002-hospedagem-staycloud.md)

## Contexto
A [ADR 0002](0002-hospedagem-staycloud.md) previa a hospedagem Pro da StayCloud. Essa hospedagem
compartilhada só oferece Node 16, e o Next 16 exige Node >= 20.9 (o `file-type` 22, [ADR 0034](0034-validacao-de-upload-e-limite-de-corpo.md),
pede Node 22).

## Decisão
Definida pelo responsável do projeto:
- Web e admin rodam num **VPS da StayCloud**: Ubuntu LTS, Node 22 LTS e Nginx como proxy reverso
  na frente dos dois servidores `output: 'standalone'`.
- `package.json` raiz declara `engines.node >= 20.9`; `.nvmrc` fixa `22` para dev e deploy.
- Continua valendo o código agnóstico de hospedagem da ADR 0002.

## Consequências
- O Nginx do VPS deve sobrescrever `X-Forwarded-For` com `$remote_addr`: o app lê o primeiro valor
  do header como IP do cliente (rate limit e `ip_hash`). Validar no spike da F3-002.
- Sistema operacional, TLS, processo (reinício) e atualizações do VPS ficam com a agência.
