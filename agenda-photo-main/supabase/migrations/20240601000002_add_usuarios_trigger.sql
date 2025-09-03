-- Garantir que a função para atualização automática de timestamp existe
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualização do timestamp
DROP TRIGGER IF EXISTS set_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER set_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Adicionar índice para melhorar pesquisas por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

-- Adicionar validações para nomes de campos inconsistentes
DO $$
BEGIN
    -- Verificar se a coluna existe com nome antigo e não existe com nome novo
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'created_at'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'criado_em'
    ) THEN
        -- Renomear coluna
        ALTER TABLE public.usuarios RENAME COLUMN created_at TO criado_em;
    END IF;

    -- Verificar se a coluna existe com nome antigo e não existe com nome novo
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'updated_at'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'atualizado_em'
    ) THEN
        -- Renomear coluna
        ALTER TABLE public.usuarios RENAME COLUMN updated_at TO atualizado_em;
    END IF;
END
$$; 