# PR-004 — SEO Foundation

## Objetivo

Estabelecer uma camada consistente de SEO técnico para todas as rotas públicas sem alterar a arquitetura SPA vigente.

## Alterações

- Componente centralizado `Seo` para metadados por rota.
- Títulos e descrições específicos para Home, marcas, novidades, categorias, marcas individuais e produtos.
- URLs canônicas baseadas em `VITE_SITE_URL`.
- Open Graph e Twitter Cards.
- Controle explícito de indexação para busca interna e página 404.
- Dados estruturados Schema.org `Product` com marca, avaliação e ofertas afiliadas.
- Metadados padrão no `index.html`.

## Configuração

Definir em produção:

```env
VITE_SITE_URL=https://dominio-oficial.com.br
```

## Critérios de aceite

- Cada rota pública relevante atualiza título, descrição e canonical.
- Busca e 404 recebem `noindex, nofollow`.
- Página de produto publica JSON-LD válido.
- Metadados sociais acompanham o conteúdo da rota.
- `npm run check` conclui sem erros.
