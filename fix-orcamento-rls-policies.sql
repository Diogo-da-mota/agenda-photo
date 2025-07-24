-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA SOLICITAÇÕES DE ORÇAMENTO
-- Problema: permission denied for table users
-- =====================================================

-- 1. Remover a política problemática que acessa auth.users.raw_app_meta_data
DROP POLICY IF EXISTS "Admins podem ver todos os orçamentos" ON solicitacoes_orcamento;

-- 2. Criar uma política mais simples para administradores
-- Usar uma abordagem diferente que não depende de raw_app_meta_data
CREATE POLICY "Admins podem ver todos os orçamentos" ON solicitacoes_orcamento
    FOR ALL USING (
        -- Verificar se o usuário tem papel de admin na tabela usuarios
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.papel = 'admin'
        )
        OR
        -- Fallback: permitir acesso se for o próprio usuário
        auth.uid() = user_id
    );

-- 3. Verificar se a política para clientes ainda está funcionando
-- (Esta deve estar OK, mas vamos recriar para garantir)
DROP POLICY IF EXISTS "Clientes podem ver seus próprios orçamentos" ON solicitacoes_orcamento;

CREATE POLICY "Clientes podem ver seus próprios orçamentos" ON solicitacoes_orcamento
    FOR ALL USING (auth.uid() = user_id);

-- 4. Política para respostas de orçamento (verificar se existe problema similar)
DROP POLICY IF EXISTS "Clientes podem ver respostas dos seus orçamentos" ON respostas_orcamento;

CREATE POLICY "Clientes podem ver respostas dos seus orçamentos" ON respostas_orcamento
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM solicitacoes_orcamento 
            WHERE solicitacoes_orcamento.id = respostas_orcamento.solicitacao_id 
            AND solicitacoes_orcamento.user_id = auth.uid()
        )
    );

-- 5. Política para administradores criarem respostas
CREATE POLICY "Admins podem criar respostas" ON respostas_orcamento
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.papel = 'admin'
        )
    );

-- 6. Política para administradores atualizarem respostas
CREATE POLICY "Admins podem atualizar respostas" ON respostas_orcamento
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.papel = 'admin'
        )
    );

-- 7. Verificar se a tabela usuarios existe e tem a estrutura correta
-- Se não existir, criar uma versão básica
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'usuario' CHECK (papel IN ('admin', 'usuario')),
    nome TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Habilitar RLS na tabela usuarios se não estiver habilitado
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 9. Políticas para a tabela usuarios
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios;

CREATE POLICY "Usuários podem ver seus próprios dados" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios dados" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

-- 10. Função para criar usuário automaticamente quando necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, papel, nome)
    VALUES (
        NEW.id,
        NEW.email,
        'usuario',
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Trigger para criar usuário automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- RESUMO DAS CORREÇÕES:
-- =====================================================
-- 
-- 1. Removida dependência de auth.users.raw_app_meta_data
-- 2. Criada estrutura de usuários na tabela public.usuarios
-- 3. Políticas RLS corrigidas para usar public.usuarios
-- 4. Trigger para criar usuários automaticamente
-- 5. Políticas mais seguras e funcionais
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Teste a criação de solicitações de orçamento
-- 3. Verifique se não há mais erros de permissão
-- =====================================================