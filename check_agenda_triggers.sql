-- Script para verificar triggers na tabela agenda_eventos
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Listar todos os triggers ativos na tabela agenda_eventos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'agenda_eventos'
AND event_object_schema = 'public'
ORDER BY trigger_name;

-- 2. Verificar a estrutura da tabela agenda_eventos (campos relacionados a timestamp)
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'agenda_eventos' 
AND table_schema = 'public'
AND column_name IN ('updated_at', 'atualizado_em', 'criado_em', 'created_at')
ORDER BY column_name;

-- 3. Verificar se existe a função update_relatorios_updated_at e seu conteúdo
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_relatorios_updated_at'
AND routine_schema = 'public';

-- 4. Verificar se existe a função handle_updated_at
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_updated_at'
AND routine_schema = 'public';

-- 5. Testar uma atualização simples para reproduzir o erro
-- COMENTADO para segurança - descomente apenas se necessário
-- UPDATE agenda_eventos 
-- SET titulo = titulo 
-- WHERE id = (SELECT id FROM agenda_eventos LIMIT 1);