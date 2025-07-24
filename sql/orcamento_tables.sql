-- =====================================================
-- TABELAS PARA ROTA /cliente/orcamento
-- Sistema de Solicitação de Orçamentos
-- =====================================================

-- Tabela principal de solicitações de orçamento
CREATE TABLE solicitacoes_orcamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_referencia VARCHAR(20) UNIQUE NOT NULL, -- Ex: ORC-726655
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Dados pessoais do solicitante
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    
    -- Detalhes do evento
    tipo_evento VARCHAR(100) NOT NULL, -- Casamento, Aniversário, etc.
    data_pretendida DATE,
    local_evento TEXT,
    numero_participantes INTEGER,
    duracao_estimada VARCHAR(100), -- "4 horas, meio período, dia inteiro"
    
    -- Detalhes adicionais
    detalhes_adicionais TEXT,
    
    -- Status e controle
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, em_analise, respondido, cancelado
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT fk_user_orcamento FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Tabela de tipos de evento (para dropdown)
CREATE TABLE tipos_evento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    ordem_exibicao INTEGER DEFAULT 0
);

-- Inserir tipos de evento padrão
INSERT INTO tipos_evento (nome, descricao, ordem_exibicao) VALUES
('Casamento', 'Cerimônia e festa de casamento', 1),
('Aniversário', 'Festa de aniversário', 2),
('Formatura', 'Cerimônia de formatura', 3),
('Evento Corporativo', 'Eventos empresariais', 4),
('Book Fotográfico', 'Sessão de fotos', 5),
('Batizado/Comunhão', 'Eventos religiosos', 6),
('Outros', 'Outros tipos de evento', 99);

-- Tabela de respostas/propostas dos orçamentos
CREATE TABLE respostas_orcamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id UUID NOT NULL REFERENCES solicitacoes_orcamento(id) ON DELETE CASCADE,
    
    -- Proposta comercial
    valor_proposto DECIMAL(10,2),
    descricao_servicos TEXT,
    condicoes_pagamento TEXT,
    prazo_validade DATE,
    
    -- Observações internas
    observacoes_internas TEXT,
    
    -- Controle
    criado_por UUID REFERENCES auth.users(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para gerar número de referência único
CREATE OR REPLACE FUNCTION gerar_numero_referencia()
RETURNS VARCHAR(20) AS $$
DECLARE
    novo_numero VARCHAR(20);
    contador INTEGER;
BEGIN
    -- Gera número aleatório de 6 dígitos
    contador := floor(random() * 900000 + 100000);
    novo_numero := 'ORC-' || contador::text;
    
    -- Verifica se já existe, se sim, tenta novamente
    WHILE EXISTS (SELECT 1 FROM solicitacoes_orcamento WHERE numero_referencia = novo_numero) LOOP
        contador := floor(random() * 900000 + 100000);
        novo_numero := 'ORC-' || contador::text;
    END LOOP;
    
    RETURN novo_numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número de referência automaticamente
CREATE OR REPLACE FUNCTION trigger_gerar_numero_referencia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_referencia IS NULL OR NEW.numero_referencia = '' THEN
        NEW.numero_referencia := gerar_numero_referencia();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_solicitacao_orcamento
    BEFORE INSERT ON solicitacoes_orcamento
    FOR EACH ROW
    EXECUTE FUNCTION trigger_gerar_numero_referencia();

-- Trigger para atualizar data_atualizacao
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_solicitacoes_orcamento_updated_at
    BEFORE UPDATE ON solicitacoes_orcamento
    FOR EACH ROW
    EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER update_respostas_orcamento_updated_at
    BEFORE UPDATE ON respostas_orcamento
    FOR EACH ROW
    EXECUTE FUNCTION trigger_updated_at();

-- Índices para performance
CREATE INDEX idx_solicitacoes_user_id ON solicitacoes_orcamento(user_id);
CREATE INDEX idx_solicitacoes_status ON solicitacoes_orcamento(status);
CREATE INDEX idx_solicitacoes_data_criacao ON solicitacoes_orcamento(data_criacao);
CREATE INDEX idx_solicitacoes_numero_ref ON solicitacoes_orcamento(numero_referencia);
CREATE INDEX idx_respostas_solicitacao_id ON respostas_orcamento(solicitacao_id);

-- Políticas RLS (Row Level Security)
ALTER TABLE solicitacoes_orcamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_orcamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_evento ENABLE ROW LEVEL SECURITY;

-- Política para clientes verem apenas seus próprios orçamentos
CREATE POLICY "Clientes podem ver seus próprios orçamentos" ON solicitacoes_orcamento
    FOR ALL USING (auth.uid() = user_id);

-- Política para administradores verem todos os orçamentos
CREATE POLICY "Admins podem ver todos os orçamentos" ON solicitacoes_orcamento
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Política para respostas de orçamento
CREATE POLICY "Clientes podem ver respostas dos seus orçamentos" ON respostas_orcamento
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM solicitacoes_orcamento 
            WHERE solicitacoes_orcamento.id = respostas_orcamento.solicitacao_id 
            AND solicitacoes_orcamento.user_id = auth.uid()
        )
    );

-- Política para tipos de evento (todos podem ler)
CREATE POLICY "Todos podem ver tipos de evento" ON tipos_evento
    FOR SELECT USING (ativo = true);

-- =====================================================
-- RESUMO DAS TABELAS CRIADAS:
-- =====================================================
-- 
-- 1. solicitacoes_orcamento - Tabela principal
--    Colunas: id, numero_referencia, user_id, nome_completo, 
--             email, telefone, tipo_evento, data_pretendida,
--             local_evento, numero_participantes, duracao_estimada,
--             detalhes_adicionais, status, data_criacao, data_atualizacao
--
-- 2. tipos_evento - Tipos de evento para dropdown
--    Colunas: id, nome, descricao, ativo, ordem_exibicao
--
-- 3. respostas_orcamento - Propostas comerciais
--    Colunas: id, solicitacao_id, valor_proposto, descricao_servicos,
--             condicoes_pagamento, prazo_validade, observacoes_internas,
--             criado_por, data_criacao, data_atualizacao
--
-- FUNCIONALIDADES:
-- - Geração automática de número de referência (ORC-XXXXXX)
-- - Suporte a múltiplos usuários com RLS
-- - Triggers para controle de datas
-- - Índices para performance
-- - Políticas de segurança
-- =====================================================