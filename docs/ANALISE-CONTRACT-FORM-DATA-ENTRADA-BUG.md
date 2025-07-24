# 🐛 ANÁLISE TÉCNICA: Bug do Placeholder `[DATA ENTRADA]` no ContractForm

## 📋 RESUMO EXECUTIVO

**Problema:** O placeholder `[DATA ENTRADA]` não está sendo substituído pela data real no template de contrato.

**Causa Raiz:** Race condition entre múltiplos `useEffect` que executam em ordens diferentes, causando sobreposição de valores no campo `termsAndConditions`.

---

## 🔍 DIAGNÓSTICO DETALHADO

### 1. **Verificação de `initialData.eventoId`** ✅

**Localização:** Linhas 351-372 em `ContractForm_new.tsx`

```typescript
// Linha 351-372
useEffect(() => {
  const buscarDataCriacao = async () => {
    if (initialData?.eventoId) {
      try {
        const { data, error } = await supabase
          .from('agenda_eventos')
          .select('criado_em')
          .eq('id', initialData.eventoId)
          .single();
        
        if (error) {
          console.error('Erro ao buscar data de criação do evento:', error);
          return;
        }
        
        if (data?.criado_em) {
          setDataCreacaoEvento(new Date(data.criado_em));
        }
      } catch (error) {
        console.error('Erro ao buscar data de criação do evento:', error);
      }
    }
  };
  buscarDataCriacao();
}, [initialData?.eventoId]);
```

**Status:** ✅ A implementação está correta - o `eventoId` está sendo usado adequadamente para buscar a data.

---

### 2. **Definição de `DEFAULT_CONTRACT_TEMPLATE`** ⚠️ **PROBLEMA CRÍTICO**

**Localização:** Linha 181 em `ContractForm_new.tsx`

```typescript
// Linha 181 - PROBLEMA AQUI
const DEFAULT_CONTRACT_TEMPLATE = generateContractTemplate();
```

**Problema Identificado:**
- `DEFAULT_CONTRACT_TEMPLATE` é calculado **uma única vez** quando o módulo é carregado
- Neste momento, `dataCreacaoEvento` é `null`, então `generateContractTemplate()` retorna `'[DATA ENTRADA]'`
- Este template "congelado" é usado como referência nas comparações posteriores
- **Resultado:** O template nunca é atualizado porque sempre contém o placeholder original

---

### 3. **Ordem de Execução dos `useEffect`** 🔄 **RACE CONDITION CRÍTICA**

#### **useEffect #1** - Reset do Formulário (Linhas 308-332)
```typescript
// EXECUTA PRIMEIRO - Antes da data ser carregada
useEffect(() => {
  if (initialData) {
    const updatedValues = {
      ...initialData,
      termsAndConditions: initialData?.termsAndConditions || getCurrentTemplate() // dataCreacaoEvento ainda é null
    };
    form.reset(updatedValues); // ⚠️ Define termsAndConditions com [DATA ENTRADA]
  }
}, [initialData, empresaConfig, form]);
```

#### **useEffect #2** - Busca da Data (Linhas 351-372)
```typescript
// EXECUTA SEGUNDO - Faz a query assíncrona
useEffect(() => {
  const buscarDataCriacao = async () => {
    // ... busca assíncrona
    setDataCreacaoEvento(new Date(data.criado_em)); // ✅ Define a data
  };
  buscarDataCriacao();
}, [initialData?.eventoId]);
```

#### **useEffect #3** - Substituição (Linhas 374-382)
```typescript
// EXECUTA TERCEIRO - Mas falha na condição
useEffect(() => {
  if (dataCreacaoEvento) {
    const currentTerms = form.watch("termsAndConditions");
    
    // ❌ FALHA AQUI: currentTerms pode não conter mais '[DATA ENTRADA]'
    if (currentTerms && currentTerms.includes('[DATA ENTRADA]')) {
      form.setValue("termsAndConditions", getCurrentTemplate());
    }
  }
}, [dataCreacaoEvento, form]);
```

---

### 4. **Comparação de Strings** ⚠️ **PROBLEMA DE SINCRONIA**

**Localização:** Linha 378 em `ContractForm_new.tsx`

```typescript
// Linha 378 - Condição que pode falhar
if (currentTerms && currentTerms.includes('[DATA ENTRADA]')) {
```

**Problemas Identificados:**

1. **Timing Issue:** Quando este `useEffect` executa, `currentTerms` pode já ter sido modificado por outros `useEffect`
2. **Template Dinâmico:** Se `getCurrentTemplate()` já foi chamado anteriormente com `dataCreacaoEvento = null`, o campo pode conter a data atual formatada ao invés do placeholder
3. **Race Condition:** O `useEffect` das linhas 340-350 pode ter rodado antes e alterado o conteúdo

---

### 5. **Race Condition / Logs Sugeridos** 🐛

**Pontos Críticos para Debug:**

```typescript
// Linha 374-382 - Adicionar logs aqui
useEffect(() => {
  console.log('🔍 DEBUG [DATA ENTRADA]:');
  console.log('dataCreacaoEvento:', dataCreacaoEvento);
  console.log('currentTerms includes [DATA ENTRADA]:', form.watch("termsAndConditions")?.includes('[DATA ENTRADA]'));
  console.log('currentTerms length:', form.watch("termsAndConditions")?.length);
  console.log('currentTerms preview:', form.watch("termsAndConditions")?.substring(0, 200));
  
  if (dataCreacaoEvento) {
    const currentTerms = form.watch("termsAndConditions");
    
    if (currentTerms && currentTerms.includes('[DATA ENTRADA]')) {
      console.log('✅ Atualizando template com data:', dataCreacaoEvento);
      form.setValue("termsAndConditions", getCurrentTemplate());
    } else {
      console.log('❌ Condição falhou - não contém [DATA ENTRADA]');
    }
  }
}, [dataCreacaoEvento, form]);
```

**Logs Adicionais Sugeridos:**

```typescript
// Linha 308 - Adicionar log no form.reset
console.log('🔄 FORM RESET - dataCreacaoEvento:', dataCreacaoEvento);
console.log('🔄 FORM RESET - template gerado:', getCurrentTemplate().substring(0, 200));

// Linha 340 - Adicionar log no useEffect da empresa
console.log('🏢 EMPRESA CONFIG - atualizando template');
console.log('🏢 EMPRESA CONFIG - currentTerms:', currentTerms?.substring(0, 200));
```

---

### 6. **Ponto Crítico** 🎯 **LINHA EXATA DO PROBLEMA**

**Linha 313:** `form.reset(updatedValues)`

```typescript
// Linhas 308-321 - PROBLEMA AQUI
useEffect(() => {
  if (initialData) {
    const updatedValues = {
      ...initialData,
      termsAndConditions: initialData?.termsAndConditions || getCurrentTemplate() // ❌ dataCreacaoEvento = null
    };
    form.reset(updatedValues); // ❌ DEFINE TEMPLATE COM [DATA ENTRADA]
  }
}, [initialData, empresaConfig, form]);
```

**Por que falha:**
1. Este `useEffect` executa **antes** da data ser carregada do Supabase
2. `getCurrentTemplate()` é chamado com `dataCreacaoEvento = null`
3. O template gerado contém `[DATA ENTRADA]` no texto
4. `form.reset()` define este template no campo `termsAndConditions`
5. Quando o `useEffect` de substituição executa (linhas 374-382), o template pode ter sido modificado novamente

**Linha 325:** Template padrão também problemática

```typescript
// Linhas 324-330 - PROBLEMA SECUNDÁRIO
} else {
  form.reset({
    termsAndConditions: getCurrentTemplate() // ❌ Também chamado com dataCreacaoEvento = null
  });
}
```

---

## 🎯 **LÓGICA EXATA QUE IMPEDE A SUBSTITUIÇÃO**

### **Sequência de Eventos Problemática:**

1. **Inicialização** (Linha 181): `DEFAULT_CONTRACT_TEMPLATE` = template com `[DATA ENTRADA]`
2. **useEffect #1** (Linha 313): `form.reset()` define template com `[DATA ENTRADA]` 
3. **useEffect #2** (Linha 351): Query assíncrona busca data e define `dataCreacaoEvento`
4. **useEffect #3** (Linha 340): Atualiza template baseado em empresa (pode sobrescrever)
5. **useEffect #4** (Linha 374): Tenta substituir `[DATA ENTRADA]`, mas:
   - Template pode ter sido alterado por useEffect #3
   - `currentTerms` pode não conter mais `[DATA ENTRADA]`
   - Condição `includes('[DATA ENTRADA]')` falha

### **Resultado Final:**
O campo `termsAndConditions` fica com o template que contém `[DATA ENTRADA]` porque a condição de substituição nunca é satisfeita no momento correto.

---

## 📊 **IMPACTO DA RACE CONDITION**

- **Severidade:** 🔴 **CRÍTICA**
- **Frequência:** 🔴 **SEMPRE** (quando `eventoId` está presente)
- **Impacto no Usuário:** Template de contrato com placeholder não substituído
- **Dados Afetados:** Campo `termsAndConditions` no formulário de contrato

---

## 🔧 **RECOMENDAÇÕES TÉCNICAS**

1. **Não definir** `DEFAULT_CONTRACT_TEMPLATE` como constante global
2. **Consolidar** a lógica de geração de template em um único ponto
3. **Aguardar** o carregamento de `dataCreacaoEvento` antes de definir `termsAndConditions`
4. **Reordenar** os `useEffect` para execução sequencial controlada
5. **Implementar** loading state durante busca da data

---

## 📝 **OBSERVAÇÕES FINAIS**

Este é um caso clássico de **race condition** onde múltiplos `useEffect` competem para modificar o mesmo campo (`termsAndConditions`) em momentos diferentes, sem coordenação adequada. A solução requer refatoração da lógica de inicialização para garantir que a data seja carregada **antes** de definir o template final.

---

**Análise realizada em:** `ContractForm_new.tsx`  
**Problema:** Placeholder `[DATA ENTRADA]` não substituído  
**Status:** 🔴 **CRÍTICO** - Requer refatoração imediata 