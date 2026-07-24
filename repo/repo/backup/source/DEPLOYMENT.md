# AKP / PapoDetailer — Publicação em produção

## Arquitetura de publicação

- Frontend: Vercel
- Banco, autenticação e storage: Supabase
- Build: Vite
- Saída estática: `dist`

## 1. Preparar o Supabase

1. Crie ou selecione o projeto de produção.
2. Aplique, em ordem, todos os arquivos de `supabase/migrations`.
3. Em Authentication, crie o usuário administrador.
4. Copie o UUID desse usuário e execute no SQL Editor:

```sql
insert into public.admin_users (user_id)
values ('UUID_DO_USUARIO')
on conflict (user_id) do nothing;
```

5. Confirme que o bucket público `product-images` existe.
6. Em Authentication > URL Configuration, configure:
   - Site URL: domínio definitivo da aplicação.
   - Redirect URLs: domínio definitivo e o domínio temporário fornecido pela Vercel, quando necessário.

## 2. Variáveis de produção

Configure na Vercel:

```env
VITE_SUPABASE_URL=https://tbedzchpotswvllghanv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZWR6Y2hwb3Rzd3ZsbGdoYW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3Mjc5OTYsImV4cCI6MjA5OTMwMzk5Nn0.EQpmCQeUTn4sV8KuUGa6s2BZjnURSy1fOB5OFkgevMc
VITE_SITE_URL=https://lucashorst7-papodeta-i7zd.bolt.host/
```

Use a chave pública/publishable do Supabase. Nunca exponha a service-role key no frontend.

## 3. Publicar na Vercel

### Fluxo recomendado — Git

1. Envie este diretório para um repositório GitHub, GitLab ou Bitbucket.
2. Na Vercel, selecione **Add New > Project**.
3. Importe o repositório.
4. Confirme:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`
5. Cadastre as três variáveis de ambiente.
6. Execute o primeiro deployment.

### Fluxo imediato — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

A CLI solicitará o vínculo com a conta e o projeto.

## 4. Checklist pós-publicação

- Home abre sem a tela de configuração inválida.
- URLs internas abrem diretamente, inclusive após atualizar o navegador.
- `/robots.txt` e `/sitemap.xml` respondem corretamente.
- Login em `/admin/login` funciona.
- Upload de imagem funciona.
- Produto publicado aparece no portal e na busca.
- Produto em rascunho aparece somente no preview administrativo.
- Links afiliados abrem e registram clique.
- Dashboard, histórico, incidentes e índice de busca carregam.

## 5. Domínio próprio

Após validar o domínio temporário da Vercel:

1. Adicione o domínio no projeto da Vercel.
2. Atualize `VITE_SITE_URL` para o domínio definitivo.
3. Atualize Site URL e Redirect URLs no Supabase Auth.
4. Faça novo deployment para regenerar canonical URLs, sitemap e robots.
