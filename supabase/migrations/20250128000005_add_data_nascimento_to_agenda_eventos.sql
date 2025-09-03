-- Adicionar coluna data_nascimento na tabela agenda_eventos
ALTER TABLE agenda_eventos 
ADD COLUMN data_nascimento DATE;

-- Comentário explicativo
COMMENT ON COLUMN agenda_eventos.data_nascimento IS 'Data de nascimento do cliente do evento';