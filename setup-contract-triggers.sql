-- Script para configurar triggers na tabela contratos
-- Este script deve ser executado no Supabase SQL Editor

-- 1. Verificar se a tabela sistema_atividades existe
CREATE TABLE IF NOT EXISTS sistema_atividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sistema_atividades_user_table_record 
ON sistema_atividades(user_id, table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_sistema_atividades_timestamp 
ON sistema_atividades(timestamp DESC);

-- 3. Função para registrar atividades
CREATE OR REPLACE FUNCTION registrar_atividade_contrato()
RETURNS TRIGGER AS $$
BEGIN
    -- Para INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO sistema_atividades (
            user_id,
            table_name,
            record_id,
            operation,
            new_data,
            timestamp
        ) VALUES (
            NEW.user_id,
            'contratos',
            NEW.id::TEXT,
            'INSERT',
            to_jsonb(NEW),
            NOW()
        );
        RETURN NEW;
    END IF;
    
    -- Para UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Registrar apenas se houve mudanças significativas
        IF OLD.status IS DISTINCT FROM NEW.status OR
           OLD.titulo IS DISTINCT FROM NEW.titulo OR
           OLD.valor_total IS DISTINCT FROM NEW.valor_total OR
           OLD.data_vencimento IS DISTINCT FROM NEW.data_vencimento THEN
            
            INSERT INTO sistema_atividades (
                user_id,
                table_name,
                record_id,
                operation,
                old_data,
                new_data,
                timestamp
            ) VALUES (
                NEW.user_id,
                'contratos',
                NEW.id::TEXT,
                'UPDATE',
                to_jsonb(OLD),
                to_jsonb(NEW),
                NOW()
            );
        END IF;
        RETURN NEW;
    END IF;
    
    -- Para DELETE
    IF TG_OP = 'DELETE' THEN
        INSERT INTO sistema_atividades (
            user_id,
            table_name,
            record_id,
            operation,
            old_data,
            timestamp
        ) VALUES (
            OLD.user_id,
            'contratos',
            OLD.id::TEXT,
            'DELETE',
            to_jsonb(OLD),
            NOW()
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger na tabela contratos
DROP TRIGGER IF EXISTS trigger_atividade_contrato ON contratos;

CREATE TRIGGER trigger_atividade_contrato
    AFTER INSERT OR UPDATE OR DELETE ON contratos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_atividade_contrato();

-- 5. Função para popular histórico de contratos existentes (executar uma vez)
CREATE OR REPLACE FUNCTION popular_historico_contratos_existentes()
RETURNS INTEGER AS $$
DECLARE
    contrato_record RECORD;
    contador INTEGER := 0;
BEGIN
    -- Inserir atividade de criação para todos os contratos existentes que não têm histórico
    FOR contrato_record IN 
        SELECT c.* 
        FROM contratos c
        LEFT JOIN sistema_atividades sa ON (
            sa.table_name = 'contratos' 
            AND sa.record_id = c.id::TEXT 
            AND sa.user_id = c.user_id
        )
        WHERE sa.id IS NULL
    LOOP
        INSERT INTO sistema_atividades (
            user_id,
            table_name,
            record_id,
            operation,
            new_data,
            timestamp
        ) VALUES (
            contrato_record.user_id,
            'contratos',
            contrato_record.id::TEXT,
            'INSERT',
            to_jsonb(contrato_record),
            contrato_record.criado_em
        );
        
        contador := contador + 1;
    END LOOP;
    
    RETURN contador;
END;
$$ LANGUAGE plpgsql;

-- 6. Executar a função para popular histórico (descomente para executar)
-- SELECT popular_historico_contratos_existentes() as contratos_processados;

-- 7. Verificar se tudo foi criado corretamente
SELECT 
    'Tabela sistema_atividades' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sistema_atividades') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'Trigger na tabela contratos' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_atividade_contrato') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'Função registrar_atividade_contrato' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'registrar_atividade_contrato') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status;

-- 8. Mostrar estatísticas
SELECT 
    COUNT(*) as total_contratos
FROM contratos;

SELECT 
    COUNT(*) as total_atividades_contratos
FROM sistema_atividades 
WHERE table_name = 'contratos';