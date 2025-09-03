-- Restaurar políticas RLS corretas baseadas na documentação original
-- Arquivo: 20250128000003_restore_correct_rls_policies.sql

-- =====================================================
-- CORRIGIR POLÍTICAS RLS - AGENDA_EVENTOS
-- =====================================================

-- Remover políticas incorretas criadas anteriormente
DROP POLICY IF EXISTS "agenda_eventos_authenticated_access" ON public.agenda_eventos;
DROP POLICY IF EXISTS "agenda_eventos_public_read" ON public.agenda_eventos;
DROP POLICY IF EXISTS "Users can access their events" ON public.agenda_eventos;

-- Criar política correta conforme documentação original
CREATE POLICY "Users can access their events" ON public.agenda_eventos
    FOR ALL
    TO public
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- CORRIGIR POLÍTICAS RLS - CONTRATOS
-- =====================================================

-- Remover políticas incorretas criadas anteriormente
DROP POLICY IF EXISTS "contratos_authenticated_access" ON public.contratos;
DROP POLICY IF EXISTS "contratos_public_read" ON public.contratos;
DROP POLICY IF EXISTS "Usuários podem ler seus próprios contratos" ON public.contratos;
DROP POLICY IF EXISTS "Usuários podem criar contratos" ON public.contratos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios contratos" ON public.contratos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios contratos" ON public.contratos;

-- Criar políticas corretas conforme documentação original
CREATE POLICY "Usuários podem ler seus próprios contratos" ON public.contratos
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar contratos" ON public.contratos
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios contratos" ON public.contratos
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios contratos" ON public.contratos
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICAR E AJUSTAR PERMISSÕES
-- =====================================================

-- Garantir que as permissões básicas estejam corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_eventos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_eventos TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contratos TO authenticated;
GRANT SELECT ON public.contratos TO anon;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "Users can access their events" ON public.agenda_eventos IS 'Política original: usuários podem acessar apenas seus próprios eventos';
COMMENT ON POLICY "Usuários podem ler seus próprios contratos" ON public.contratos IS 'Política original: usuários autenticados podem ler apenas seus próprios contratos';
COMMENT ON POLICY "Usuários podem criar contratos" ON public.contratos IS 'Política original: usuários podem criar contratos (verificação via user_id)';
COMMENT ON POLICY "Usuários podem atualizar seus próprios contratos" ON public.contratos IS 'Política original: usuários autenticados podem atualizar apenas seus próprios contratos';
COMMENT ON POLICY "Usuários podem deletar seus próprios contratos" ON public.contratos IS 'Política original: usuários autenticados podem deletar apenas seus próprios contratos';