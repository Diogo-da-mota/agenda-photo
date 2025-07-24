-- Atualizar função de validação para 3GB por usuário e 10MB por arquivo
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  file_name text,
  file_size bigint,
  content_type text
) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_file_size bigint := 10485760; -- 10MB (mantido)
  max_user_storage bigint := 3221225472; -- 3GB (alterado de 50GB)
  allowed_types text[] := ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'image/bmp', 'image/tiff', 'image/svg+xml'
  ];
  current_user_storage bigint;
BEGIN
  -- Verificar tamanho do arquivo
  IF file_size > max_file_size THEN
    RAISE EXCEPTION 'Arquivo muito grande. Máximo permitido: 10MB';
  END IF;
  
  -- Verificar tipo de arquivo
  IF NOT (content_type = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'Tipo de arquivo não permitido';
  END IF;
  
  -- Verificar armazenamento total do usuário
  SELECT COALESCE(SUM(size), 0) INTO current_user_storage
  FROM storage.objects
  WHERE owner = auth.uid();
  
  IF (current_user_storage + file_size) > max_user_storage THEN
    RAISE EXCEPTION 'Limite de armazenamento excedido. Máximo: 3GB por usuário';
  END IF;
  
  RETURN true;
END;
$$; 