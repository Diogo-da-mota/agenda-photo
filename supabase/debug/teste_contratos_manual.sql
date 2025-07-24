-- =====================================================
-- TESTE MANUAL DOS CONTRATOS NO SUPABASE
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA CONTRATOS
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contratos' 
ORDER BY ordinal_position;

-- 2. VERIFICAR POLÍTICAS RLS ATIVAS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'contratos' 
ORDER BY policyname;

-- 3. VERIFICAR SE A TABELA TEM RLS HABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'contratos';

-- 4. VERIFICAR DADOS NA TABELA CONTRATOS
SELECT 
    id,
    titulo,
    status,
    user_id,
    cliente_id,
    criado_em,
    CASE 
        WHEN user_id IS NULL THEN '❌ user_id NULL'
        ELSE '✅ user_id OK'
    END as user_id_status
FROM public.contratos 
ORDER BY criado_em DESC;

-- 5. VERIFICAR CLIENTES RELACIONADOS
SELECT 
    c.id as contrato_id,
    c.titulo,
    c.user_id as contrato_user_id,
    cl.id as cliente_id,
    cl.nome as cliente_nome,
    cl.user_id as cliente_user_id
FROM public.contratos c
LEFT JOIN public.clientes cl ON c.cliente_id = cl.id
ORDER BY c.criado_em DESC;

-- 6. TESTE COM USER_ID ESPECÍFICO (substitua pelo ID real do usuário logado)
-- Para testar, execute uma das queries abaixo com o user_id correto:

-- QUERY PADRÃO QUE O FRONTEND USA:
/*
SELECT c.*, cl.*
FROM public.contratos c
LEFT JOIN public.clientes cl ON c.cliente_id = cl.id
WHERE c.user_id = 'SEU_USER_ID_AQUI'
ORDER BY c.criado_em DESC;
*/

-- 7. TESTAR SE O RLS ESTÁ BLOQUEANDO
-- Execute como superuser para ver todos os dados:
/*
SET row_security = off;
SELECT * FROM public.contratos;
SET row_security = on;
*/

-- 8. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- QUERIES DE CORREÇÃO (se necessário)
-- =====================================================

-- Corrigir user_id NULL (se houver registros sem user_id)
/*
UPDATE public.contratos 
SET user_id = 'SEU_USER_ID_AQUI'
WHERE user_id IS NULL;
*/

-- Recriar políticas RLS corretas
/*
DROP POLICY IF EXISTS "Users can view their own contracts" ON public.contratos;
CREATE POLICY "Users can view their own contracts" 
ON public.contratos FOR SELECT 
USING (auth.uid() = user_id);
*/
