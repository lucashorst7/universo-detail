# PR-011 — Crawler Discovery

## Objetivo

Permitir que mecanismos de busca descubram as páginas públicas indexáveis do portal sem expor rotas administrativas ou páginas internas de busca.

## Alterações

- Geração automática de `public/robots.txt`.
- Geração automática de `public/sitemap.xml` antes de cada build.
- Inclusão das rotas públicas estáticas: Home, marcas e novidades.
- Inclusão dinâmica de categorias, marcas e produtos por meio da API pública do Supabase.
- Uso de `created_at` como `lastmod` enquanto o schema não possui `updated_at`.
- Exclusão explícita das rotas `/admin` e `/busca` no `robots.txt`.
- Fallback seguro para sitemap estático quando as credenciais ou o banco não estiverem disponíveis no ambiente de build.
- Escape XML para slugs e URLs.

## Configuração

O build dinâmico utiliza as variáveis já existentes:

```env
VITE_SITE_URL=https://dominio-oficial.com.br
VITE_SUPABASE_URL=https://projeto.supabase.co
VITE_SUPABASE_ANON_KEY=chave-publica
```

Sem credenciais válidas, o processo continua e gera apenas as URLs estáticas.

## Comandos

```bash
npm run generate:crawler
npm run build
```

## Critérios de aceite

- `robots.txt` referencia o sitemap canônico.
- Rotas administrativas e busca interna não são sugeridas para rastreamento.
- Sitemap contém URLs públicas estáticas e, quando possível, dinâmicas.
- Falha de rede ou ausência de credenciais não interrompe o build.
- `npm run check` conclui sem erros.
