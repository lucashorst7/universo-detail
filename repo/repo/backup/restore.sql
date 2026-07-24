-- ============================================================
-- SCRIPT MASTER DE RESTAURAÇÃO COMPLETA
-- Projeto: Papo Detailer (Estética Automotiva)
-- Data do Backup: 2026-07-22
--
-- USO: psql "sua_string_de_conexao" -f restore.sql
-- Ou execute cada arquivo manualmente na ordem indicada
-- ============================================================

-- PASSO 0: Usuários de autenticação
\i supabase/auth/00_auth_users.sql

-- PASSO 1: Criar tabelas
\i supabase/schema/01_schema.sql

-- PASSO 2: Políticas RLS
\i supabase/rls/02_rls_policies.sql

-- PASSO 3: Índices
\i supabase/indexes/03_indexes.sql

-- PASSO 4: Funções
\i supabase/functions/04_functions.sql

-- PASSO 5: Triggers
\i supabase/triggers/05_triggers.sql

-- PASSO 6: Dados
\i supabase/data/06_data.sql

-- PASSO 7: Chaves estrangeiras e unique
\i supabase/schema/07_foreign_keys.sql

-- RESTAURAÇÃO COMPLETA!
