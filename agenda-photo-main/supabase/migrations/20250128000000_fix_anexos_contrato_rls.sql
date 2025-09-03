-- Correção das políticas RLS para anexos_contrato
-- Adiciona políticas para INSERT, UPDATE e DELETE que estavam faltando

-- Remover política existente se houver
DROP POLICY IF EXISTS "Fotógrafos veem anexos de seus contratos" ON public.anexos_contrato;

-- Política para SELECT (visualização)
CREATE POLICY "Fotógrafos podem ver anexos de seus contratos" 
ON public.anexos_contrato
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = anexos_contrato.id_contrato
    AND contratos.id_fotografo = auth.uid()
));

-- Política para INSERT (criação)
CREATE POLICY "Fotógrafos podem inserir anexos em seus contratos" 
ON public.anexos_contrato
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = anexos_contrato.id_contrato
    AND contratos.id_fotografo = auth.uid()
));

-- Política para UPDATE (atualização)
CREATE POLICY "Fotógrafos podem atualizar anexos de seus contratos" 
ON public.anexos_contrato
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = anexos_contrato.id_contrato
    AND contratos.id_fotografo = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = anexos_contrato.id_contrato
    AND contratos.id_fotografo = auth.uid()
));

-- Política para DELETE (exclusão)
CREATE POLICY "Fotógrafos podem deletar anexos de seus contratos" 
ON public.anexos_contrato
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = anexos_contrato.id_contrato
    AND contratos.id_fotografo = auth.uid()
));