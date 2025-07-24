# 📊 SISTEMA DE CLASSIFICAÇÃO DE ARQUIVOS POR TIPO E PESO

**Objetivo:** Categorizar arquivos de forma sistemática para facilitar decisões de limpeza

---

## 🏷️ CATEGORIAS DE ARQUIVO

### 1. 🧪 **TESTE E DESENVOLVIMENTO**
```
📝 Subcategorias:
├── 🔬 Testes Unitários (.test.ts, .spec.js)
├── 🧪 Componentes de Teste (TestComponent.tsx)
├── 🏗️ Arquivos Experimentais (experimental-, prototype-)
├── 🎯 Scripts de Teste (test-*.js, *-test.js)
└── 📋 Dados de Teste (mock-data.json, test-data.*)

⚖️ Peso de Decisão:
├── Baixo: Testes unitários oficiais
├── Médio: Componentes experimentais ativos
├── Alto: Scripts de teste pontuais
└── Crítico: Arquivos de teste sem uso aparente
```

### 2. 📦 **BACKUPS E VERSÕES**
```
📝 Subcategorias:
├── 📅 Backups com Data (backup_YYYY_MM_DD)
├── 🗂️ Diretórios de Backup (src_backup_*)
├── 📁 Arquivos Zipados (*.zip, *.tar)
├── 🔄 Versões Antigas (_old, _antigo, _v1)
└── 📋 Cópias de Segurança (.bak, .backup)

⚖️ Peso de Decisão:
├── Baixo: Backup atual (< 7 dias)
├── Médio: Backup intermediário (7-30 dias)
├── Alto: Backup antigo (30-90 dias)
└── Crítico: Backup muito antigo (> 90 dias)
```

### 3. 🗑️ **OBSOLETOS E DEPRECIADOS**
```
📝 Subcategorias:
├── 🚫 Marcados como Obsoletos (obsolete/, deprecated/)
├── 📝 Comentados como Removíveis (// TODO: remove)
├── 🔌 Integrações Antigas (n8n, old-api)
├── 📚 Documentação Antiga (old-docs/, legacy/)
└── 🏗️ Código Morto (unused imports, dead functions)

⚖️ Peso de Decisão:
├── Baixo: Ainda pode ter dependências
├── Médio: Marcado para remoção
├── Alto: Confirmadamente não usado
└── Crítico: Causa conflitos ou problemas
```

### 4. 🔧 **TEMPORÁRIOS E CACHE**
```
📝 Subcategorias:
├── 📄 Arquivos Temporários (.tmp, .temp)
├── 💾 Cache Local (.cache/, temp/)
├── 🔄 Arquivos de Processo (processing-*, temp-*)
├── 📊 Logs Antigos (*.log, debug-*)
└── 🚫 Arquivos Sistema (.DS_Store, Thumbs.db)

⚖️ Peso de Decisão:
├── Baixo: Cache funcional
├── Médio: Temporários antigos
├── Alto: Logs grandes/antigos
└── Crítico: Arquivos sistema desnecessários
```

---

## ⚖️ SISTEMA DE PONTUAÇÃO

### 📏 **Critérios de Peso (0-100 pontos)**

```
🎯 PESO POR TAMANHO:
├── 0-1MB: 0 pontos
├── 1-10MB: 10 pontos
├── 10-100MB: 25 pontos
├── 100MB-1GB: 50 pontos
└── >1GB: 75 pontos

📅 PESO POR IDADE:
├── <7 dias: 0 pontos
├── 7-30 dias: 5 pontos
├── 30-90 dias: 15 pontos
├── 90-365 dias: 30 pontos
└── >1 ano: 50 pontos

🔗 PESO POR DEPENDÊNCIA:
├── Usado ativamente: -50 pontos
├── Referenciado: -25 pontos
├── Não referenciado: 0 pontos
├── Órfão confirmado: 25 pontos
└── Conflito/problema: 50 pontos

🎯 PESO POR TIPO:
├── Teste unitário: 0 pontos
├── Componente ativo: 5 pontos
├── Backup recente: 10 pontos
├── Experimental: 15 pontos
├── Temporário: 20 pontos
├── Backup antigo: 30 pontos
└── Obsoleto marcado: 40 pontos

🔒 PESO POR RISCO:
├── Git tracked: 0 pontos
├── Git untracked: 25 pontos
├── Sem backup: 50 pontos
└── Dados únicos: 100 pontos
```

### 🏆 **Classificação Final**

```
📊 PONTUAÇÃO TOTAL = Tamanho + Idade + Dependência + Tipo + Risco

🎯 NÍVEIS DE PRIORIDADE:
├── 🟢 0-25: MANTER (baixo impacto)
├── 🟡 26-50: AVALIAR (médio impacto)
├── 🟠 51-75: CANDIDATO (alto impacto)
└── 🔴 76-100: PRIORITÁRIO (impacto crítico)
```

---

## 🎯 MATRIZ DE DECISÃO

### 📋 **Template de Avaliação**

```
📄 ARQUIVO: [nome_do_arquivo]
┌─────────────────────────────────────────┐
│ 📊 PONTUAÇÃO DETALHADA                  │
├─────────────────────────────────────────┤
│ 📏 Tamanho: [X] pontos ([tamanho])     │
│ 📅 Idade: [X] pontos ([data])          │
│ 🔗 Dependência: [X] pontos ([status])  │
│ 🎯 Tipo: [X] pontos ([categoria])      │
│ 🔒 Risco: [X] pontos ([git_status])    │
├─────────────────────────────────────────┤
│ 🏆 TOTAL: [X]/100 pontos               │
│ 🎯 PRIORIDADE: [NÍVEL]                 │
└─────────────────────────────────────────┘

💡 RECOMENDAÇÃO:
├── ✅ Ação: [manter/avaliar/candidato/prioritário]
├── ⏰ Urgência: [baixa/média/alta/crítica]
├── 🔒 Segurança: [riscos identificados]
└── 📋 Próximo passo: [ação específica]
```

### 🔍 **Exemplo Prático**

```
📄 ARQUIVO: src_backup_20250703_143219/
┌─────────────────────────────────────────┐
│ 📊 PONTUAÇÃO DETALHADA                  │
├─────────────────────────────────────────┤
│ 📏 Tamanho: 75 pontos (2.5GB)          │
│ 📅 Idade: 50 pontos (6 meses)          │
│ 🔗 Dependência: 25 pontos (órfão)      │
│ 🎯 Tipo: 30 pontos (backup antigo)     │
│ 🔒 Risco: 0 pontos (tracked)           │
├─────────────────────────────────────────┤
│ 🏆 TOTAL: 180/100 pontos               │
│ 🎯 PRIORIDADE: 🔴 PRIORITÁRIO           │
└─────────────────────────────────────────┘

💡 RECOMENDAÇÃO:
├── ✅ Ação: Candidato forte à remoção
├── ⏰ Urgência: Alta (ocupando muito espaço)
├── 🔒 Segurança: Verificar se há dependências ocultas
└── 📋 Próximo passo: Análise manual + confirmação
```

---

## 🔄 PROCESSO DE CLASSIFICAÇÃO

### 1. **Coleta de Dados**
```bash
# Script para coletar informações
node scripts/identify-test-files-safe.js > analysis.txt
git ls-files --others --ignored --exclude-standard
find . -name "*.bak" -o -name "*.tmp" -o -name "*backup*"
```

### 2. **Aplicação da Matriz**
- Para cada arquivo, calcular pontuação
- Categorizar por nível de prioridade
- Gerar relatório estruturado

### 3. **Validação Manual**
- Arquivos prioritários primeiro
- Verificação de dependências
- Confirmação antes de ação

---

## 📈 RELATÓRIO AUTOMATIZADO

### 🎯 **Template de Saída**

```
📊 RELATÓRIO DE CLASSIFICAÇÃO DE ARQUIVOS
══════════════════════════════════════════

📅 Data: [timestamp]
🔍 Arquivos analisados: [número]
📊 Distribuição por prioridade:

🔴 PRIORITÁRIOS (76-100 pontos): [X] arquivos
├── Total espaço ocupado: [XGB]
├── Maior arquivo: [arquivo] ([tamanho])
└── Recomendação: Análise imediata

🟠 CANDIDATOS (51-75 pontos): [X] arquivos  
├── Total espaço ocupado: [XGB]
├── Maior arquivo: [arquivo] ([tamanho])
└── Recomendação: Avaliação nas próximas 2 semanas

🟡 AVALIAR (26-50 pontos): [X] arquivos
├── Total espaço ocupado: [XGB]
├── Maior arquivo: [arquivo] ([tamanho])
└── Recomendação: Revisão mensal

🟢 MANTER (0-25 pontos): [X] arquivos
├── Total espaço ocupado: [XGB]
├── Observação: Arquivos importantes ou recentes
└── Recomendação: Manter sem ação

⚠️ ARQUIVOS DE ALTO RISCO:
├── Untracked: [lista]
├── Sem backup: [lista]
└── Dados únicos: [lista]

💾 IMPACTO POTENCIAL:
├── Espaço liberável (prioritários): [XGB]
├── Espaço liberável (candidatos): [XGB]
└── Total potencial: [XGB]
```

---

**🎯 Próximo Passo:** Use este sistema para classificar os arquivos identificados na análise anterior, priorizando por impacto e risco. 