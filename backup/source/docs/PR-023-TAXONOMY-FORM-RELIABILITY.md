# PR-023 — Taxonomy Form Reliability

## Objetivo
Tornar os formulários administrativos de marcas e categorias previsíveis diante de falhas de rede, conflitos de slug e substituição de imagens.

## Implementação
- RPCs administrativas `save_brand` e `save_category` com validação no PostgreSQL.
- Preservação dos triggers de histórico de slug e auditoria na mesma transação.
- Estados explícitos de carregamento, erro, nova tentativa e sucesso.
- Mensagens amigáveis para slugs atuais ou históricos já reservados.
- Validação de nome, slug e ordem de exibição no cliente e no banco.
- Limpeza de capas gerenciadas substituídas ou descartadas, sem remover URLs externas.
- Labels associados aos campos e regiões acessíveis para feedback.

## Migration
`supabase/migrations/20260711050000_add_taxonomy_form_reliability.sql`
