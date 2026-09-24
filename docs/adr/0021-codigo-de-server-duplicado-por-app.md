# 0021 · Código de server duplicado por app

- Status: accepted · Data: 2026-09-23
- Specs: [SEC-003, SEC-008](../specs/02-security-rls.md), [ADM-014](../specs/05-admin-panel.md)

## Contexto
Web e admin precisam de utilitários de server parecidos (logger, `redactPersonalData`,
`failAction`, validação do env). Um pacote compartilhado em `packages/` aumentaria o
acoplamento entre os apps para pouco código.

## Decisão
- Não existe pacote de server compartilhado. Cada app mantém sua cópia em `lib/`.
- Logger, redact e `failAction` só entram no `apps/admin` quando ele precisar deles de verdade.
- A exceção possível é o envio do webhook (ADM-014): a F5-007 reavalia só esse código.

## Consequências
- Correção num utilitário duplicado precisa ser aplicada nos dois apps.
- Os apps continuam independentes para build e deploy.
