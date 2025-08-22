-- Verificar e corrigir políticas RLS para restaurar acesso aos dados

-- Primeiro, vamos remover todas as políticas RLS restritivas existentes
DROP POLICY IF EXISTS "agenda_eventos_select_policy" ON public.agenda_eventos;
DROP POLICY IF EXISTS "agenda_eventos_insert_policy" ON public.agenda_eventos;
DROP POLICY IF EXISTS "agenda_eventos_update_policy" ON public.agenda_eventos;
DROP POLICY IF EXISTS "agenda_eventos_delete_policy" ON public.agenda_eventos;

DROP POLICY IF EXISTS "contratos_select_policy" ON public.contratos;
DROP POLICY IF EXISTS "contratos_insert_policy" ON public.contratos;
DROP POLICY IF EXISTS "contratos_update_policy" ON public.contratos;
DROP POLICY IF EXISTS "contratos_delete_policy" ON public.contratos;

-- Remover outras possíveis políticas restritivas
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.agenda_eventos;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.contratos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.agenda_eventos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.contratos;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.agenda_eventos;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.contratos;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.agenda_eventos;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.contratos;

-- Criar políticas mais permissivas para agenda_eventos
-- Permitir acesso completo para usuários autenticados aos seus próprios dados
CREATE POLICY "agenda_eventos_authenticated_access" ON public.agenda_eventos
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir leitura pública para anon (necessário para login de cliente)
CREATE POLICY "agenda_eventos_public_read" ON public.agenda_eventos
    FOR SELECT
    TO anon
    USING (true);

-- Criar políticas mais permissivas para contratos
-- Permitir acesso completo para usuários autenticados aos seus próprios dados
CREATE POLICY "contratos_authenticated_access" ON public.contratos
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir leitura pública para anon (necessário para visualização de contratos por clientes)
CREATE POLICY "contratos_public_read" ON public.contratos
    FOR SELECT
    TO anon
    USING (true);

-- Garantir que as permissões básicas estejam concedidas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_eventos TO authenticated;
GRANT SELECT ON public.agenda_eventos TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contratos TO authenticated;
GRANT SELECT ON public.contratos TO anon;

-- Comentários para documentação
COMMENT ON POLICY "agenda_eventos_authenticated_access" ON public.agenda_eventos IS 'Permite acesso completo aos eventos para usuários autenticados (seus próprios dados)';
COMMENT ON POLICY "agenda_eventos_public_read" ON public.agenda_eventos IS 'Permite leitura pública para login de clientes';
COMMENT ON POLICY "contratos_authenticated_access" ON public.contratos IS 'Permite acesso completo aos contratos para usuários autenticados (seus próprios dados)';
COMMENT ON POLICY "contratos_public_read" ON public.contratos IS 'Permite leitura pública para visualização de contratos por clientes';