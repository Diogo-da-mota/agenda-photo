-- =====================================================
-- CRIAÇÃO MANUAL DE USUÁRIOS ADMINISTRADORES
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Desabilitar RLS temporariamente para permitir inserção
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Inserir os 3 usuários administradores
-- Baseado nas informações fornecidas pelo usuário
INSERT INTO public.usuarios (id, email, nome, papel) VALUES 
('c73397a9-808c-4acc-95f7-81f4ffeeb5da', 'anunciodofacebook2022@gmail.com', 'Diogo Gonçalves da Mota', 'admin'),
('3f8eebe6-a4c5-4353-9f67-f746da9d2ac9', 'shopalbrasil@gmail.com', 'Shop Albrasil', 'admin'),
('581d2fbd-9fe4-4d62-87d2-ca07d501261e', 'agendaparafotografo@gmail.com', 'agenda Fotógrafo', 'admin')
ON CONFLICT (id) DO UPDATE SET
    papel = EXCLUDED.papel,
    nome = EXCLUDED.nome;

-- 3. Reabilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se os usuários foram criados corretamente
SELECT 
    id,
    email,
    nome,
    papel,
    criado_em
FROM public.usuarios 
WHERE papel = 'admin'
ORDER BY email;

-- 5. Verificar total de administradores
SELECT 
    COUNT(*) as total_admins
FROM public.usuarios 
WHERE papel = 'admin';

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole e execute este script
-- 4. Verifique se os 3 administradores foram criados
-- 5. Execute o script check-admin-users.cjs novamente para confirmar
-- 
-- NOTA: Os UUIDs gerados são únicos e válidos.
-- Se você tiver os UUIDs reais dos usuários autenticados,
-- substitua pelos valores corretos.
-- =====================================================