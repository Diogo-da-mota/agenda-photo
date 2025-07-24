-- Adiciona coluna de código de referência
ALTER TABLE indicacoes
ADD COLUMN codigo_referencia TEXT UNIQUE,
ADD COLUMN link_indicacao TEXT GENERATED ALWAYS AS (
    'https://fotograf.app/r/' || codigo_referencia
) STORED;

-- Índice para busca rápida por código
CREATE INDEX idx_indicacoes_codigo ON indicacoes(codigo_referencia);

-- Adiciona RLS policies para a tabela indicacoes
ALTER TABLE indicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias indicações"
ON indicacoes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias indicações"
ON indicacoes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias indicações"
ON indicacoes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Função para gerar código de referência único
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    code TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código de referência automaticamente
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_referencia IS NULL THEN
        LOOP
            NEW.codigo_referencia := generate_referral_code();
            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM indicacoes 
                WHERE codigo_referencia = NEW.codigo_referencia
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
BEFORE INSERT ON indicacoes
FOR EACH ROW
EXECUTE FUNCTION set_referral_code(); 