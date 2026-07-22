# Backup Completo do Projeto - Papo Detailer

**Data do Backup:** 22 de Julho de 2026  
**Projeto:** Papo Detailer (Estética Automotiva)  
**Repositório:** https://github.com/lucashorst7/universo-detail  
**Banco de Dados:** Supabase (PostgreSQL)

---

## Estrutura do Backup

```
backup/
├── README.md                              # Este arquivo
├── restore.sql                            # Script master de restauração (psql)
│
├── source/                                # CÓDIGO-FONTE COMPLETO (do GitHub)
│   ├── package.json                       # Dependências do projeto
│   ├── package-lock.json
│   ├── vite.config.ts                     # Configuração do Vite
│   ├── tsconfig.json                      # TypeScript
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vitest.config.ts                   # Testes
│   ├── tailwind.config.js                 # Tailwind CSS
│   ├── eslint.config.js                   # ESLint
│   ├── index.html                         # Entry point HTML
│   ├── .env.example                       # Exemplo de variáveis de ambiente
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── README.md
│   ├── SECURITY.md
│   ├── DEPLOYMENT.md
│   ├── dependabot.yml
│   ├── performance-budget.json
│   ├── quality-gate.yml
│   │
│   ├── src/                               # CÓDIGO-FONTE DA APLICAÇÃO
│   │   ├── App.tsx                        # Componente raiz
│   │   ├── main.tsx                       # Entry point
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── vite-env.d.ts
│   │   ├── types.ts
│   │   │
│   │   ├── pages/                         # 38 páginas da aplicação
│   │   │   ├── HomePage.tsx / Home.tsx
│   │   │   ├── ProductsPage.tsx / ProductDetailPage.tsx
│   │   │   ├── CategoriesPage.tsx / CategoryDetailPage.tsx
│   │   │   ├── BrandsPage.tsx / BrandDetailPage.tsx
│   │   │   ├── CollectionsPage.tsx / CollectionDetailPage.tsx
│   │   │   ├── GuidesPage.tsx / GuideDetailPage.tsx
│   │   │   ├── SearchPage.tsx / DiscoverPage.tsx
│   │   │   ├── ComparePage.tsx / WishlistPage.tsx
│   │   │   ├── LoginPage.tsx / RegisterPage.tsx
│   │   │   ├── AccountPage.tsx / VerifyEmailPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx / ResetPasswordPage.tsx
│   │   │   ├── AboutPage.tsx / ContactPage.tsx
│   │   │   ├── BlogPage.tsx / BlogPostPage.tsx / BlogDetailPage.tsx
│   │   │   ├── KitBuilderPage.tsx / NewProductsPage.tsx
│   │   │   ├── PrivacyPage.tsx / TermsPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── admin/                     # Páginas admin
│   │   │       ├── AdminDashboardPage.tsx
│   │   │       ├── AdminProductsPage.tsx
│   │   │       ├── AdminBrandsPage.tsx
│   │   │       ├── AdminCategoriesPage.tsx
│   │   │       ├── AdminMembersPage.tsx
│   │   │       └── AdminReviewsPage.tsx
│   │   │
│   │   ├── components/                     # 30+ componentes reutilizáveis
│   │   │   ├── Header.tsx / Footer.tsx
│   │   │   ├── Layout.tsx / AdminLayout.tsx
│   │   │   ├── ProductCard.tsx / ProductForm.tsx
│   │   │   ├── ProductFilters.tsx / ProductRating.tsx
│   │   │   ├── SearchAutocomplete.tsx
│   │   │   ├── CompareBar.tsx / Badge.tsx
│   │   │   ├── Comments.tsx / Feedback.tsx
│   │   │   ├── ShareButtons.tsx / StarRating.tsx
│   │   │   ├── RelatedProducts.tsx
│   │   │   ├── TechnicalSpecsCard.tsx
│   │   │   ├── ScrollReveal.tsx / Seo.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── DeleteConfirmModal.tsx
│   │   │   ├── AdminUI.tsx
│   │   │   ├── categoryIcons.tsx
│   │   │   ├── ui/                         # UI primitives
│   │   │   │   ├── Container.tsx
│   │   │   │   ├── ErrorState.tsx
│   │   │   │   └── ResilientImage.tsx
│   │   │   └── *.css                      # Estilos dos componentes
│   │   │
│   │   ├── lib/                            # 20+ módulos de lógica
│   │   │   ├── supabase.ts                 # Cliente Supabase
│   │   │   ├── auth.tsx                    # Autenticação
│   │   │   ├── adminAuth.ts                # Auth admin
│   │   │   ├── products.ts                 # Queries de produtos
│   │   │   ├── queries.ts                  # Queries gerais
│   │   │   ├── search.ts                   # Busca
│   │   │   ├── slug.ts / slugRedirect.ts   # URL slugs
│   │   │   ├── compare.ts / wishlist.ts    # Compara/desejos
│   │   │   ├── storage.ts                  # Storage
│   │   │   ├── affiliateTracking.ts       # Rastreamento afiliados
│   │   │   ├── errorReporting.ts          # Report de erros
│   │   │   ├── productFilters.ts          # Filtros
│   │   │   ├── productUtils.ts            # Utils de produtos
│   │   │   ├── categorySpecs.ts           # Specs por categoria
│   │   │   ├── specsCalculations.ts        # Cálculos de specs
│   │   │   ├── blogData.ts / blogPosts.ts  # Blog
│   │   │   ├── logos.ts / site.ts          # Logos e config do site
│   │   │   └── ...
│   │   │
│   │   ├── providers/
│   │   │   └── AdminAuthProvider.tsx       # Provider de auth admin
│   │   │
│   │   ├── types/                           # Tipos TypeScript
│   │   │   ├── index.ts
│   │   │   ├── database.ts
│   │   │   ├── database.generated.ts
│   │   │   └── seo.ts
│   │   │
│   │   └── assets/                         # Imagens locais
│   │
│   ├── public/                             # Arquivos estáticos
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── *.png                           # Logos e imagens
│   │
│   ├── migrations/                         # 23 migrations SQL originais
│   ├── docs/                               # 32 documentos de PR
│   ├── scripts/                            # Scripts Python de scraping
│   └── *.html                              # Páginas HTML de referência
│
└── supabase/                               # BACKUP DO BANCO DE DADOS
    ├── migrations/
    │   └── migration_list.txt              # Lista de 59 migrations
    ├── schema/
    │   ├── 01_schema.sql                   # 22 tabelas + tipo enum
    │   ├── 07_foreign_keys.sql             # FKs + constraints unique
    │   └── 08_check_constraints.sql        # Constraints check
    ├── rls/
    │   └── 02_rls_policies.sql             # 52 políticas RLS
    ├── indexes/
    │   └── 03_indexes.sql                  # 54 índices
    ├── functions/
    │   └── 04_functions.sql                # 37 funções PL/pgSQL
    ├── triggers/
    │   └── 05_triggers.sql                  # 11 triggers
    ├── data/
    │   └── 06_data.sql                     # INSERT de todos os dados
    └── auth/
        └── 00_auth_users.sql               # Usuários de autenticação
```

---

## Resumo dos Dados

| Tabela                  | Registros |
|-------------------------|-----------|
| categories              | 8         |
| brands                  | 29        |
| products                | 105       |
| product_categories      | 105       |
| collections             | 3         |
| collection_items        | 11        |
| guides                  | 2         |
| guide_products          | 3         |
| spotlight               | 1         |
| customer_reviews        | 1         |
| admin_users             | 1         |
| user_profiles           | 1         |
| admin_audit_logs        | 14        |
| category_slug_history   | 7         |
| search_documents        | 105       |
| affiliate_links         | 0         |
| affiliate_clicks        | 0         |
| product_slug_history    | 0         |
| brand_slug_history      | 0         |
| runtime_error_logs      | 0         |
| search_insights         | 0         |
| banned_users            | 0         |
| **auth.users**          | 1         |
| **Total**               | **392**   |

---

## Como Restaurar

### Passo 1: Restaurar o Código-Fonte

```bash
# Opção A: Clonar do GitHub
git clone https://github.com/lucashorst7/universo-detail

# Opção B: Copiar da pasta backup/source/
# Copie todo o conteúdo de backup/source/ para o diretório do projeto
```

Depois instale as dependências:
```bash
npm install
```

### Passo 2: Restaurar o Banco de Dados

**Ordem de execução (CRÍTICA):**

1. `auth/00_auth_users.sql` — Usuários de autenticação
2. `schema/01_schema.sql` — Criação das tabelas + RLS habilitado
3. `rls/02_rls_policies.sql` — Políticas de segurança
4. `indexes/03_indexes.sql` — Índices
5. `functions/04_functions.sql` — Funções PL/pgSQL
6. `triggers/05_triggers.sql` — Triggers
7. `data/06_data.sql` — Dados (INSERTs)
8. `schema/07_foreign_keys.sql` — Chaves estrangeiras e unique

**Via Supabase Dashboard:** SQL Editor > cole cada arquivo na ordem > Run

**Via psql:**
```bash
psql "sua_string_de_conexao" -f supabase/auth/00_auth_users.sql
psql "sua_string_de_conexao" -f supabase/schema/01_schema.sql
psql "sua_string_de_conexao" -f supabase/rls/02_rls_policies.sql
psql "sua_string_de_conexao" -f supabase/indexes/03_indexes.sql
psql "sua_string_de_conexao" -f supabase/functions/04_functions.sql
psql "sua_string_de_conexao" -f supabase/triggers/05_triggers.sql
psql "sua_string_de_conexao" -f supabase/data/06_data.sql
psql "sua_string_de_conexao" -f supabase/schema/07_foreign_keys.sql
```

### Passo 3: Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha com as credenciais do Supabase:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Passo 4: Iniciar o Projeto

```bash
npm run dev
```

---

## Notas Importantes

- **Tipo Enum:** `product_status` (draft, review, published, archived) é criado no schema
- **RLS:** Todas as 22 tabelas têm Row Level Security com 52 políticas
- **Funções SECURITY DEFINER:** Algumas funções usam `SECURITY DEFINER` intencionalmente
- **Usuário Admin:** `lucashorst@hotmail.com` incluído com senha hash bcrypt
- **Triggers de Auditoria:** Registram alterações em `admin_audit_logs` automaticamente
- **Search Documents:** Sincronizados via trigger, mas incluídos no backup para evitar reprocessamento
- **Migrations:** 59 migrations catalogadas em `migration_list.txt`
- **Código-fonte:** Inclui arquivos `copy` (duplicados) que existiam no repositório GitHub
