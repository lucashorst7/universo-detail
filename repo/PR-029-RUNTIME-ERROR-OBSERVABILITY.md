# PR-029 — Runtime Error Observability

## Objetivo
Registrar falhas inesperadas da aplicação com um código de incidente seguro, permitindo diagnóstico administrativo sem expor stack traces ao público.

## Entregas
- Captura de erros do React Error Boundary, `window.error` e rejeições não tratadas.
- Sanitização de rota com remoção de query strings.
- Deduplicação de incidentes idênticos durante a sessão.
- RPC pública limitada para registro e RPC administrativa paginada para consulta.
- Página `/admin/incidentes` com busca, filtro e paginação.
- Código de incidente exibido ao usuário quando o registro for concluído.

## Migration
`supabase/migrations/20260711070000_add_runtime_error_observability.sql`

## Privacidade
O registro não armazena parâmetros de query, cookies, tokens, corpo de requisições ou conteúdo de formulários.
