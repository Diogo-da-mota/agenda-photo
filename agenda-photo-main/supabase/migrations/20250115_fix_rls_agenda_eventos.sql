-- Política RLS para permitir acesso público de leitura à tabela agenda_eventos
-- Necessário para o sistema de login funcionar

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura pública" ON agenda_eventos;
DROP POLICY IF EXISTS "public_read_agenda_eventos" ON agenda_eventos;

-- Criar política que permite leitura pública
CREATE POLICY "public_read_agenda_eventos" ON agenda_eventos
    FOR SELECT
    USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE agenda_eventos ENABLE ROW LEVEL SECURITY;

-- Conceder permissões básicas para roles anon e authenticated
GRANT SELECT ON agenda_eventos TO anon;
GRANT SELECT ON agenda_eventos TO authenticated;
GRANT ALL ON agenda_eventos TO authenticated;

-- Verificar se as permissões foram aplicadas
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'agenda_eventos'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY grantee, privilege_type;