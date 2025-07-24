-- =====================================================
-- TESTE: CONTRATO COM CONTEÚDO PERSONALIZADO
-- =====================================================

-- 1. PRIMEIRO, VERIFICAR SE HÁ USUÁRIOS DISPONÍVEIS
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. INSERIR UM CLIENTE DE TESTE (se necessário)
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário
INSERT INTO public.clientes (
    user_id,
    nome,
    email,
    telefone,
    cpf,
    endereco,
    cidade,
    estado,
    cep
) VALUES (
    'SEU_USER_ID_AQUI',
    'Cliente Teste PDF',
    'cliente.teste@email.com',
    '(11) 99999-9999',
    '123.456.789-00',
    'Rua Teste, 123',
    'São Paulo',
    'SP',
    '01234-567'
) ON CONFLICT (cpf) DO NOTHING;

-- 3. INSERIR CONTRATO COM CONTEÚDO PERSONALIZADO
-- Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário
INSERT INTO public.contratos (
    user_id,
    cliente_id,
    titulo,
    status,
    conteudo,
    valor,
    criado_em
) VALUES (
    'SEU_USER_ID_AQUI',
    (SELECT id FROM public.clientes WHERE email = 'cliente.teste@email.com' AND user_id = 'SEU_USER_ID_AQUI' LIMIT 1),
    'Contrato Teste - Conteúdo Personalizado',
    'ativo',
    '# CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS - PERSONALIZADO

## CONTRATANTE
**Nome:** {{CLIENTE_NOME}}
**CPF:** {{CLIENTE_CPF}}
**Email:** {{CLIENTE_EMAIL}}
**Telefone:** {{CLIENTE_TELEFONE}}
**Endereço:** {{CLIENTE_ENDERECO}}

## CONTRATADA
**Empresa:** {{EMPRESA_NOME}}
**CNPJ:** {{EMPRESA_CNPJ}}
**Email:** {{EMPRESA_EMAIL}}
**Telefone:** {{EMPRESA_TELEFONE}}

## OBJETO DO CONTRATO
Este contrato tem por objeto a prestação de serviços fotográficos para o evento **{{EVENTO_TIPO}}** que será realizado no dia **{{DATA_EVENTO}}**.

## VALOR E FORMA DE PAGAMENTO
O valor total dos serviços é de **R$ {{VALOR_TOTAL}}**, sendo:
- Entrada: R$ {{VALOR_ENTRADA}}
- Saldo: R$ {{VALOR_SALDO}}

## CLÁUSULAS ESPECIAIS - CONTEÚDO PERSONALIZADO
1. **EXCLUSIVIDADE**: A contratada terá exclusividade fotográfica durante todo o evento.

2. **ENTREGA**: As fotos editadas serão entregues em até 30 dias após o evento via galeria online.

3. **DIREITOS DE IMAGEM**: O contratante autoriza o uso das imagens para divulgação do trabalho da contratada.

4. **CANCELAMENTO**: Em caso de cancelamento com mais de 30 dias de antecedência, será devolvido 50% do valor pago.

## ASSINATURA
Este contrato foi gerado automaticamente em {{DATA_ATUAL}} e é válido mediante aceite eletrônico.

---
**ESTE É UM CONTRATO DE TESTE COM CONTEÚDO PERSONALIZADO DA COLUNA "conteudo"**',
    2500.00,
    NOW()
);

-- 4. VERIFICAR SE O CONTRATO FOI INSERIDO
SELECT 
    id,
    titulo,
    status,
    LENGTH(conteudo) as tamanho_conteudo,
    SUBSTRING(conteudo, 1, 100) || '...' as preview_conteudo
FROM public.contratos 
WHERE titulo = 'Contrato Teste - Conteúdo Personalizado'
ORDER BY criado_em DESC;

-- 5. BUSCAR O ID DO CONTRATO PARA TESTE
SELECT 
    id,
    titulo,
    'Para testar, acesse: /contrato/' || id as url_teste
FROM public.contratos 
WHERE titulo = 'Contrato Teste - Conteúdo Personalizado'
ORDER BY criado_em DESC
LIMIT 1;

-- =====================================================
-- INSTRUÇÕES PARA TESTE
-- =====================================================
/*
1. Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário logado
2. Execute este script no Supabase SQL Editor
3. Anote o ID do contrato criado
4. Acesse a URL: http://localhost:8081/contrato/[ID_DO_CONTRATO]
5. Teste o download do PDF para verificar se o conteúdo personalizado aparece
6. O conteúdo deve incluir os placeholders substituídos pelos dados reais
*/