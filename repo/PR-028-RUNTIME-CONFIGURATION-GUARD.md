# PR-028 — Runtime Configuration Guard

## Objetivo

Impedir que variáveis de ambiente ausentes ou inválidas provoquem uma falha opaca durante a inicialização do portal.

## Implementação

- Validação centralizada e tipada de `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_SITE_URL`.
- Exigência de HTTPS para hosts não locais.
- Tela de falha segura antes da montagem da aplicação.
- Mensagens sem exposição dos valores configurados.
- Cliente Supabase criado com configuração neutra apenas quando a aplicação está bloqueada pelo guard.
- Testes unitários para configurações válidas, ausentes, malformadas e locais.
- Inclusão do novo módulo no relatório obrigatório de cobertura.

## Resultado operacional

Uma publicação incorretamente configurada deixa de apresentar tela em branco ou exceção de inicialização. O operador recebe uma indicação objetiva das variáveis que precisam ser corrigidas, sem que chaves ou URLs completas sejam reveladas na interface.

## Migration

Nenhuma migration é necessária.
