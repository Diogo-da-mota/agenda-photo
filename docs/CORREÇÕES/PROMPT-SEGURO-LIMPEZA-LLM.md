# 🛡️ PROMPT SEGURO PARA LIMPEZA DE ARQUIVOS COM LLM

**Objetivo:** Identificar arquivos de teste de forma segura, sem risco de exclusões acidentais

---

## 🔒 PROMPT PARA COPIAR E USAR

```plaintext
🔍 ANÁLISE SEGURA DE ARQUIVOS DE TESTE

Por favor, analise a estrutura do projeto e identifique arquivos que PODEM ser de teste ou temporários, seguindo estes critérios:

📋 CRITÉRIOS DE IDENTIFICAÇÃO:
- Nomes com: "test", "teste", "temp", "demo", "backup", "bkp", "obsolete"
- Diretórios: __tests__, testing, temp, backup, __archive__
- Extensões: .test.js, .test.ts, .tmp, .temp, .bak
- Arquivos grandes que aparentam ser backups
- Componentes experimentais em desenvolvimento

🚫 REGRAS CRÍTICAS DE SEGURANÇA:
1. NUNCA delete, mova ou modifique nenhum arquivo
2. APENAS liste e categorize os arquivos encontrados
3. Se houver QUALQUER dúvida, NÃO inclua o arquivo na lista
4. Marque arquivos "untracked" (não versionados) como ALTA PRIORIDADE para análise manual
5. Não considere automicamente que algo é "lixo" - sempre liste como "para análise"

📊 FORMATO DE RESPOSTA:
Para cada arquivo identificado, informe:
- Caminho completo
- Tamanho aproximado
- Motivo da inclusão na lista
- Nível de confiança (Alto/Médio/Baixo)
- Status no git (tracked/untracked/unknown)

⚠️ LEMBRETE FINAL:
Esta é uma análise exploratória. NENHUMA ação deve ser tomada nos arquivos sem confirmação humana explícita.
```

---

## 📝 PROMPT ALTERNATIVO (Mais Restritivo)

```plaintext
🔍 IDENTIFICAÇÃO CONSERVADORA DE ARQUIVOS DE TESTE

Analise APENAS arquivos que são OBVIAMENTE temporários/teste, usando critérios muito restritivos:

✅ INCLUIR APENAS SE:
- Nome contém exatamente "test-", ".test.", "temp-"
- Está em pasta chamada exatamente "__tests__" ou "testing"
- Extensão é .tmp, .temp, .bak
- É um backup com data no nome (ex: backup_2024_01_01)

🚫 NÃO INCLUIR SE:
- Há qualquer dúvida sobre o propósito
- Pode ser usado por outros arquivos
- Está em produção ou pode afetar funcionalidades
- É arquivo de configuração (mesmo que pareça teste)

📋 RESPOSTA OBRIGATÓRIA:
Para cada arquivo: "CONFIANÇA: [Alta/Baixa] | MOTIVO: [específico] | AÇÃO: [apenas análise]"

⚠️ IMPORTANTE: Em caso de dúvida, NÃO liste o arquivo.
```

---

## 🎯 EXEMPLO DE USO SEGURO

### ✅ Resposta Esperada da LLM:
```
🔍 ARQUIVOS IDENTIFICADOS PARA ANÁLISE

📁 Alta Confiança:
├── test-upload-behavior.js (script de teste específico)
├── __tests__/example.test.ts (diretório de testes)
└── backup_src_20240101.zip (backup com data)

📁 Média Confiança:
├── src/components/ExperimentalButton.tsx (componente experimental)
└── temp_validation.js (arquivo temporário)

📁 Baixa Confiança:
├── src/utils/helper.test.ts (pode ser teste unitário válido)

⚠️ ARQUIVOS UNTRACKED (PRIORIDADE MANUAL):
├── new-feature-test.tsx (não versionado - ANÁLISE OBRIGATÓRIA)

📊 RESUMO: 3 alta confiança, 2 média, 1 baixa
🔒 AÇÃO: Análise manual requerida para todos os itens
```

### ❌ Resposta Problemática (Evitar):
```
❌ ARQUIVOS PARA DELETAR:
├── test-file.js (pode ser deletado)
├── old_component.tsx (parece não usado)

❌ COMANDOS SUGERIDOS:
rm test-file.js
git rm old_component.tsx
```

---

## 🛡️ VALIDAÇÃO DE SEGURANÇA

### ✅ Checklist da Resposta da LLM:
- [ ] Não contém comandos de exclusão
- [ ] Todas as recomendações são "analisar" ou "avaliar"
- [ ] Arquivos untracked são marcados como prioridade
- [ ] Há níveis de confiança especificados
- [ ] Inclui avisos de segurança na resposta

### 🚨 Red Flags (Parar Imediatamente):
- Qualquer comando rm, del, delete
- Frases como "pode ser deletado com segurança"
- Sugestões de ações automáticas
- Certeza absoluta sobre arquivos desconhecidos

---

## 🔧 COMO USAR

1. **Antes de usar:** Faça backup do projeto
2. **Durante:** Monitore a resposta em busca de red flags
3. **Depois:** Analise manualmente cada arquivo sugerido
4. **Sempre:** Confirme status no git antes de qualquer ação

---

**💡 Dica:** Use este prompt em sessões separadas com diferentes LLMs para comparar resultados e aumentar a confiança na análise. 