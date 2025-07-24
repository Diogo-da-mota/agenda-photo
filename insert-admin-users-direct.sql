-- =====================================================
-- INSERÇÃO DIRETA DE USUÁRIOS ADMINISTRADORES
-- Contorna as políticas RLS temporariamente
-- =====================================================

-- Temporariamente desabilitar RLS para inserção
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- Inserir os usuários administradores
-- Baseado na imagem fornecida pelo usuário
INSERT INTO public.usuarios (id, email, nome, papel) VALUES
(
    '9c3932ab-4f08-4f65-a44c-4f243d3e5dc9'::uuid,
    'anunciodofacebook2022@gmail.com',
    'Diogo Gonçalves da Mota',
    'admin'
),
(
    'b0986d4-450a-4eed-bd4f-567fa377fd75'::uuid,
    'shopalbrasil@gmail.com',
    'Shop Albrasil', 
    'admin'
),
(
    'ef02279e-57c3-44a6-9c59-f22a28544e1'::uuid,
    'agendaparafotografo@gmail.com',
    'agenda Fotógrafo',
    'admin'
)
ON CONFLICT (id) DO UPDATE SET
    papel = EXCLUDED.papel,
    nome = EXCLUDED.nome;

-- Reabilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Verificar se os usuários foram inseridos
SELECT 
    id,
    email,
    nome,
    papel,
    criado_em
FROM public.usuarios 
WHERE papel = 'admin'
ORDER BY email;

-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique se os 3 usuários administradores foram criados
-- 3. As políticas RLS serão reabilitadas automaticamente
-- 
-- NOTA: Os UUIDs devem corresponder aos IDs reais dos
-- usuários autenticados no auth.users do Supabase
-- =====================================================