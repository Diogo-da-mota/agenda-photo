-- ========================================
-- CORREÇÃO DE POLÍTICAS STORAGE PARA IMAGENS
-- Problema: Erros 403 Forbidden no Storage
-- Solução: Configurar políticas adequadas para bucket 'imagens'
-- Data: 2025-01-27
-- ========================================

-- STEP 1: Criar bucket 'imagens' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagens', 'imagens', true)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Remover políticas antigas conflitantes
DROP POLICY IF EXISTS "Usuários podem visualizar imagens públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar próprias imagens" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar próprias imagens" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- STEP 3: Criar políticas corretas para o bucket 'imagens'

-- Política para visualizar imagens (público)
CREATE POLICY "Public can view images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'imagens');

-- Política para upload de imagens (usuários autenticados)
CREATE POLICY "Authenticated users can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'imagens' 
  AND auth.role() = 'authenticated'
);

-- Política para atualizar imagens (apenas próprias)
CREATE POLICY "Users can update own images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'imagens' 
  AND auth.uid()::text = (storage.foldername(name))[1]
) 
WITH CHECK (
  bucket_id = 'imagens' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para deletar imagens (apenas próprias)
CREATE POLICY "Users can delete own images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'imagens' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ========================================
-- VERIFICAÇÃO DAS POLÍTICAS CRIADAS
-- Execute esta query para confirmar:
-- ========================================
/*
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
*/

-- ========================================
-- RESULTADO ESPERADO:
-- 4 políticas criadas para storage.objects
-- Bucket 'imagens' público para leitura
-- Upload apenas para usuários autenticados
-- Update/Delete apenas para próprias imagens
-- ======================================== 