-- Migração para criar a nova estrutura da tabela fotos_drive

-- 1. Recriar a tabela fotos_drive com a estrutura solicitada
-- Primeiro, vamos fazer backup dos dados existentes
CREATE TABLE IF NOT EXISTS public.fotos_drive_backup AS
SELECT * FROM public.fotos_drive;

-- Agora, vamos remover a tabela existente
DROP TABLE IF EXISTS public.fotos_drive;

-- E recriar com a estrutura solicitada
CREATE TABLE public.fotos_drive (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_pasta text NOT NULL,
    fotos text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now()
);

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS fotos_drive_usuario_id_idx ON public.fotos_drive(usuario_id);
CREATE INDEX IF NOT EXISTS fotos_drive_nome_pasta_idx ON public.fotos_drive(nome_pasta);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.fotos_drive IS 'Armazena informações sobre fotos no Google Drive';
COMMENT ON COLUMN public.fotos_drive.id IS 'Chave primária da imagem';
COMMENT ON COLUMN public.fotos_drive.usuario_id IS 'Referência ao usuário';
COMMENT ON COLUMN public.fotos_drive.nome_pasta IS 'Nome do trabalho/pasta (ex: "teste")';
COMMENT ON COLUMN public.fotos_drive.fotos IS 'Lista de nomes de arquivos (ex: [01.jpg])';
COMMENT ON COLUMN public.fotos_drive.created_at IS 'Data de criação automática';

-- Habilitar RLS para segurança de dados
ALTER TABLE public.fotos_drive ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas RLS para isolar dados por usuário
CREATE POLICY "Usuários podem ver apenas suas próprias fotos" ON public.fotos_drive
    FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem modificar apenas suas próprias fotos" ON public.fotos_drive
    FOR ALL
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id); 