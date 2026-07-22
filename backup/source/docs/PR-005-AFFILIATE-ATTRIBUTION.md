# PR-005 — Affiliate Attribution

## Objetivo

Mensurar cliques de saída para marketplaces e oferecer visibilidade operacional no painel administrativo, sem coletar identificadores pessoais.

## Alterações

- Tabela `affiliate_clicks` com índices por link, produto e data.
- RPC pública e validada `track_affiliate_click` para impedir escrita arbitrária na tabela.
- RLS permitindo leitura somente por administradores.
- Registro assíncrono no clique dos botões de compra, sem bloquear a navegação.
- Armazenamento apenas do link, produto, rota, domínio externo de referência e data.
- Divulgação comercial junto às ofertas.
- Dashboard atualizado com total de cliques afiliados.
- Página administrativa de links com total dos últimos 30 dias e contagem por destino.

## Aplicação da migration

Executar a migration:

```text
supabase/migrations/20260710170000_add_affiliate_click_attribution.sql
```

## Critérios de aceite

- O clique abre o marketplace normalmente mesmo se a telemetria falhar.
- Clientes públicos não podem consultar ou inserir diretamente em `affiliate_clicks`.
- Administradores visualizam os cliques dos últimos 30 dias por link.
- Nenhum IP, user-agent, e-mail ou identificador persistente é armazenado.
- `npm run check` conclui sem erros.
