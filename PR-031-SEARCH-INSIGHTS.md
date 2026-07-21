# PR-031 — Search Insights

## Objetivo

Transformar a busca dedicada da PR-030 em uma fonte operacional de inteligência de conteúdo, sem coletar identidade, endereço IP, user agent, rota completa ou parâmetros de navegação.

## Implementação

- `search_insights` armazena somente o termo normalizado, a quantidade de resultados e o horário.
- `record_search_insight` é a única superfície pública de escrita e limita os dados no PostgreSQL.
- Eventos equivalentes são deduplicados no cliente por 30 segundos.
- Falhas de telemetria nunca bloqueiam nem alteram o resultado da busca.
- `get_search_operations_snapshot` agrega os últimos 30 dias e exige administrador.
- O painel apresenta volume, termos distintos, buscas sem resultado, consultas frequentes e oportunidades de conteúdo.
- A tabela não possui políticas públicas de leitura e não expõe eventos brutos ao navegador.

## Migration

`supabase/migrations/20260711090000_add_search_insights.sql`

## Privacidade

Não são armazenados identificadores de usuário, cookies, IP, user agent, referer, query string da URL ou conteúdo de formulário além do termo de busca explicitamente submetido.
