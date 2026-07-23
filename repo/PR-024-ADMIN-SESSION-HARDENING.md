# PR-024 — Admin Session Hardening

## Objetivo

Fortalecer o ciclo de autenticação administrativa, detectar revogações de acesso e expirações de sessão sem depender de falhas indiretas nas telas do painel.

## Implementação

- RPC `validate_admin_session()` restrita a usuários autenticados.
- Revalidação da autorização a cada cinco minutos.
- Revalidação quando a aba volta a ficar visível ou a janela recupera foco.
- Deduplicação de validações concorrentes.
- Tratamento explícito de sessão expirada, falha de validação e acesso revogado.
- Tela segura de recuperação com nova tentativa ou encerramento da sessão.
- Preservação da rota originalmente solicitada durante o login.
- Redirecionamento de usuários já autenticados para o painel.
- Indicador discreto de sessão protegida no menu administrativo.
- Mensagem de login genérica para reduzir enumeração de credenciais.

## Migration

`supabase/migrations/20260711060000_add_admin_session_hardening.sql`

## Validação

```bash
npm run lint
npm run typecheck
npm run build
npm run check
```
