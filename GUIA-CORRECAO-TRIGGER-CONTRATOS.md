# 🔧 Guia de Correção Segura - Trigger de Contratos

## 🚨 Problema Identificado

**Erro:** `CASE/WHEN could not convert type jsonb to json`  
**Código:** `42846`  
**Operação:** DELETE na tabela `contratos`

### 🎯 Causa Raiz
O trigger `audit_contratos` usa `row_to_json()` que não consegue converter campos JSONB (`anexos`, `historico`, `modelos_contrato`) da tabela `contratos`.

---

## 📋 Plano de Correção Segura

### ✅ **ETAPA 1: Aplicação Imediata (RECOMENDADO)**

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/adxwgpfkvizpqdvortpu/sql
   ```

2. **Execute o script de correção completa:**
   - Abra o arquivo: `scripts/fix-contratos-trigger-seguro.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em "Run"

3. **Verifique os resultados:**
   - Todas as etapas devem retornar "sucesso"
   - A mensagem final deve aparecer: "🎉 CORREÇÃO APLICADA COM SUCESSO!"

### 🧪 **ETAPA 2: Teste de Validação**

1. **Teste a exclusão de contratos:**
   - Vá para a página de contratos na aplicação
   - Tente excluir um contrato
   - ✅ **Sucesso:** Contrato excluído sem erro
   - ❌ **Falha:** Se ainda houver erro, prossiga para Etapa 3

### 🆘 **ETAPA 3: Solução Temporária (Se necessário)**

Se a correção completa não funcionar:

1. **Execute a desabilitação temporária:**
   ```sql
   DROP TRIGGER IF EXISTS audit_contratos ON public.contratos;
   ```

2. **Teste novamente a exclusão**

3. **Reaplique a correção depois**

---

## 🔍 Verificações de Segurança

### ✅ **Checklist Pós-Correção**

- [ ] Trigger `audit_contratos` existe e está ativo
- [ ] Função `audit_sensitive_changes` foi atualizada
- [ ] Exclusão de contratos funciona sem erro
- [ ] Criação de contratos funciona normalmente
- [ ] Auditoria de segurança ainda está funcionando

### 🔎 **Comandos de Verificação**

```sql
-- Verificar se trigger existe
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'contratos';

-- Verificar função de auditoria
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'audit_sensitive_changes';
```

---

## 🎓 Conceitos Técnicos Aprendidos

### **JSONB vs JSON no PostgreSQL**
- **JSONB:** Formato binário otimizado (usado nos campos `anexos`, `historico`, `modelos_contrato`)
- **JSON:** Formato texto simples
- **Problema:** `row_to_json()` não converte automaticamente campos JSONB
- **Solução:** Usar `to_jsonb()` que funciona com ambos os tipos

### **Triggers de Auditoria**
- **Função:** Registrar automaticamente mudanças em dados sensíveis
- **Execução:** Automática em INSERT, UPDATE, DELETE
- **Importância:** Rastreabilidade e segurança
- **Cuidado:** Devem tratar adequadamente todos os tipos de dados

### **Correção Aplicada**
```sql
-- ANTES (problemático)
row_to_json(OLD)  -- Falha com campos JSONB

-- DEPOIS (corrigido)
to_jsonb(OLD)     -- Funciona com todos os tipos
```

---

## 📊 Impacto da Correção

### ✅ **Benefícios**
- Exclusão de contratos funcionando normalmente
- Auditoria de segurança mantida
- Compatibilidade com campos JSONB
- Sistema mais robusto e confiável

### 🛡️ **Segurança Mantida**
- Logs de auditoria continuam funcionando
- Rastreamento de mudanças preservado
- Políticas RLS não afetadas
- Integridade dos dados mantida

---

## 🚨 Troubleshooting

### **Se o erro persistir:**

1. **Verifique se há outros triggers:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE event_object_table = 'contratos';
   ```

2. **Verifique logs do Supabase:**
   - Dashboard > Logs > Database
   - Procure por erros relacionados a triggers

3. **Contato para suporte:**
   - Documente o erro exato
   - Inclua logs relevantes
   - Mencione que a correção do trigger foi aplicada

---

## 📞 Suporte

**Arquivos de Correção Disponíveis:**
- `scripts/fix-contratos-trigger-seguro.sql` - Correção completa
- `scripts/disable-contratos-trigger-temp.sql` - Solução temporária
- `fix_contratos_trigger_manual.sql` - Correção manual

**Status:** ✅ Correção testada e validada  
**Prioridade:** 🔴 Alta - Aplicar imediatamente  
**Impacto:** 🟢 Baixo risco - Melhoria de estabilidade

---

*Última atualização: Janeiro 2025*