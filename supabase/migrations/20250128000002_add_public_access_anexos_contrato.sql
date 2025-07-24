-- Migração: Adicionar acesso público aos anexos de contratos
-- Data: 2025-01-28
-- Descrição: Permite que clientes visualizem anexos de contratos publicamente

-- Adicionar política para acesso público aos anexos de contratos
-- Isso permite que clientes vejam anexos sem estar autenticados
CREATE POLICY "Acesso público aos anexos de contratos"
ON public.anexos_contrato
FOR SELECT
USING (true);

-- Comentário explicativo:
-- Esta política permite acesso público de leitura aos anexos de contratos.
-- Isso é necessário para que clientes possam visualizar anexos na página
-- pública de contratos (/cliente/contrato/:id) sem precisar estar logados.
-- 
-- Segurança: Apenas leitura é permitida. Criação, edição e exclusão
-- continuam restritas aos usuários autenticados através das outras políticas.