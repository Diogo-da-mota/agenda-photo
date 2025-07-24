-- ================================================
-- CORREÇÃO SIMPLIFICADA: BUCKET ENTREGAR-IMAGENS
-- Versão sem privilégios administrativos
-- Data: 2025-01-28
-- ================================================

-- STEP 1: Criar bucket 'entregar-imagens' (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('entregar-imagens', 'entregar-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Criar função check_rls_status (se não existir)
CREATE OR REPLACE FUNCTION check_rls_status(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = table_name
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  );
END;
$$;

-- STEP 3: Verificar se as políticas já existem antes de criar
DO $$
BEGIN
  -- Política para visualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can view entregar-imagens files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view entregar-imagens files" 
    ON storage.objects 
    FOR SELECT 
    USING (
      bucket_id = ''entregar-imagens'' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    )';
  END IF;

  -- Política para upload
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload entregar-imagens files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload entregar-imagens files" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = ''entregar-imagens'' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    )';
  END IF;

  -- Política para atualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update entregar-imagens files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update entregar-imagens files" 
    ON storage.objects 
    FOR UPDATE 
    USING (
      bucket_id = ''entregar-imagens'' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    ) 
    WITH CHECK (
      bucket_id = ''entregar-imagens'' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    )';
  END IF;

  -- Política para exclusão
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete entregar-imagens files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete entregar-imagens files" 
    ON storage.objects 
    FOR DELETE 
    USING (
      bucket_id = ''entregar-imagens'' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    )';
  END IF;
END $$;