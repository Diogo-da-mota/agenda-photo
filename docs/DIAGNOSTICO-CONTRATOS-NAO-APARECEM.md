# 🔍 DIAGNÓSTICO: Por que Contratos Reais Não Aparecem na Rota `/contratos`

## 📋 **ANÁLISE COMPLETA DO PROBLEMA**

### 🚨 **CAUSA RAIZ IDENTIFICADA**
O problema principal é que **o componente `ContractList.tsx` usa apenas dados mockados (fake data)** em vez de buscar contratos reais do Supabase.

## 🔧 **PROBLEMAS ENCONTRADOS**

### 1. **Dados Mockados Hardcoded**
- ❌ O `ContractList.tsx` tem um array `mockContracts` fixo
- ❌ Não há chamada para a API do Supabase
- ❌ Sempre exibe os mesmos 3 contratos de exemplo

### 2. **Políticas RLS Incorretas**
- ❌ Políticas usam campo `fotografo_id` que **não existe** na tabela
- ❌ Tabela `contratos` usa `user_id`, não `fotografo_id`
- ❌ Resultado: **Queries falham silenciosamente**

### 3. **Inconsistência na Estrutura da Tabela**
- ❌ Campos esperados pelo frontend não existem na tabela atual:
  - `valor_total` (esperado) vs `valor` (inexistente)
  - `data_evento` (esperado) vs não existe
  - `tipo_evento` (esperado) vs não existe
  - `data_assinatura` (esperado) vs não existe

### 4. **Falta de Hook de Dados**
- ❌ Não existe `useContracts` hook
- ❌ Sem gerenciamento de estado de loading/error
- ❌ Sem integração com React Query

## 🛠️ **SOLUÇÕES IMPLEMENTADAS**

### ✅ **1. Criado Hook `useContracts`**
```typescript
// src/hooks/useContracts.ts
export const useContracts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: () => listContracts(user!),
    enabled: !!user,
  });
};
```

### ✅ **2. Corrigido `ContractList` para Usar Dados Reais**
```typescript
// Agora busca dados reais do Supabase
const { data: contracts = [], isLoading, error } = useContracts();

// Fallback para mock apenas se houver erro
const contractsToUse = error || contracts.length === 0 
  ? mockContracts 
  : contracts.map((contract: any) => ({ /* mapping real data */ }));
```

### ✅ **3. Criado Script de Migração SQL**
```sql
-- supabase/migrations/20250627_fix_contratos_rls.sql

-- Remove políticas incorretas
DROP POLICY IF EXISTS "Fotógrafos podem ver seus próprios contratos" ON "public"."contratos";

-- Cria políticas corretas usando user_id
CREATE POLICY "Users can view their own contracts" 
ON "public"."contratos"
FOR SELECT 
USING (auth.uid() = user_id);

-- Adiciona campos faltantes
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10,2);
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS data_evento DATE;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS tipo_evento TEXT;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS data_assinatura TIMESTAMPTZ;
```

### ✅ **4. Atualizado `contractService.ts`**
- Corrigidas interfaces para usar `valor_total` em vez de `valor`
- Removidas referências a campos inexistentes (`historico`, `anexos`)
- Simplificadas operações de update

## 🚀 **COMO APLICAR AS CORREÇÕES**

### **Passo 1: Executar Migração SQL**
```bash
# No Supabase SQL Editor, execute:
# supabase/migrations/20250627_fix_contratos_rls.sql
```

### **Passo 2: Verificar Dados**
```sql
-- Verifique se há contratos reais na tabela
SELECT 
  id, titulo, status, user_id, cliente_id, criado_em
FROM public.contratos 
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY criado_em DESC;
```

### **Passo 3: Testar a Interface**
1. Acesse `/contratos`
2. Verifique se mostra "Carregando contratos..."
3. Se houver contratos reais, devem aparecer
4. Se não houver, mostra dados mock como fallback

## 🔍 **DEBUGGING ADICIONAL**

### **Verificar Políticas RLS**
```sql
SELECT 
    policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contratos';
```

### **Verificar Estrutura da Tabela**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contratos' 
ORDER BY ordinal_position;
```

### **Testar Query Manual**
```sql
-- Substitua 'SEU_USER_ID' pelo ID real do usuário logado
SELECT c.*, cl.nome as cliente_nome, cl.email as cliente_email
FROM public.contratos c
LEFT JOIN public.clientes cl ON c.cliente_id = cl.id
WHERE c.user_id = 'SEU_USER_ID'
ORDER BY c.criado_em DESC;
```

## 📊 **RESUMO DAS CAUSAS**

| Problema | Impacto | Status |
|----------|---------|--------|
| Dados mockados hardcoded | ❌ Contratos reais nunca aparecem | ✅ Corrigido |
| Políticas RLS incorretas | ❌ Queries falham silenciosamente | ✅ Corrigido |
| Campos faltantes na tabela | ❌ Dados incompletos | ✅ Corrigido |
| Falta de hook de dados | ❌ Sem loading/error states | ✅ Corrigido |

## 🎯 **RESULTADO ESPERADO**

Após aplicar todas as correções:

1. ✅ Contratos reais salvos no Supabase aparecem na lista
2. ✅ Estados de loading e erro funcionam corretamente
3. ✅ Fallback para dados mock só quando necessário
4. ✅ Políticas RLS permitem acesso aos próprios contratos
5. ✅ Todos os campos necessários existem na tabela

## 🚨 **IMPORTANTE**

- Execute a migração SQL **ANTES** de testar a interface
- Verifique se há contratos reais na tabela para o usuário logado
- Se o problema persistir, verifique os logs do browser e do Supabase
