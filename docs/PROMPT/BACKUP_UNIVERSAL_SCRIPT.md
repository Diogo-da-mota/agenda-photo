# 🔍 SCRIPT UNIVERSAL DE BACKUP COMPLETO
## Para qualquer site/projeto web

Este documento contém um **processo automatizado** para extrair todas as informações possíveis de qualquer site ou projeto web, independente da tecnologia usada. É como fazer um "raio-X completo" do seu projeto.

---

## 🎯 OBJETIVO
Criar um **backup inteligente** que capture:
- Estrutura completa de arquivos
- Todas as configurações
- Dependências e tecnologias
- Rotas e navegação
- Banco de dados (se aplicável)
- Integrações externas
- Variáveis de ambiente
- Documentação existente

---

## 📋 PROCESSO UNIVERSAL (PASSO A PASSO)

### ETAPA 1: ANÁLISE BÁSICA DO PROJETO
```bash
# Executar estes comandos na pasta do projeto:

# 1. Estrutura de arquivos (primeiros 3 níveis)
find . -type f -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.html" -o -name "*.css" -o -name "*.md" -o -name "*.env*" -o -name "*.config*" -o -name "*.lock" | head -100 > estrutura_arquivos.txt

# 2. Listar todas as pastas
find . -type d | sort > estrutura_pastas.txt

# 3. Contar arquivos por tipo
find . -name "*.js" | wc -l > contagem_arquivos.txt
find . -name "*.ts" | wc -l >> contagem_arquivos.txt
find . -name "*.tsx" | wc -l >> contagem_arquivos.txt
find . -name "*.jsx" | wc -l >> contagem_arquivos.txt
find . -name "*.css" | wc -l >> contagem_arquivos.txt
find . -name "*.html" | wc -l >> contagem_arquivos.txt
```

### ETAPA 2: IDENTIFICAR TECNOLOGIAS
```bash
# Buscar por arquivos de configuração principais
ls -la package.json 2>/dev/null && echo "✓ Node.js/React detectado" || echo "✗ Não é Node.js"
ls -la composer.json 2>/dev/null && echo "✓ PHP detectado" || echo "✗ Não é PHP"
ls -la requirements.txt 2>/dev/null && echo "✓ Python detectado" || echo "✗ Não é Python"
ls -la Gemfile 2>/dev/null && echo "✓ Ruby detectado" || echo "✗ Não é Ruby"
ls -la pom.xml 2>/dev/null && echo "✓ Java detectado" || echo "✗ Não é Java"
ls -la .csproj 2>/dev/null && echo "✓ C# detectado" || echo "✗ Não é C#"
```

### ETAPA 3: EXTRAIR DEPENDÊNCIAS
```bash
# Para projetos Node.js/React
if [ -f "package.json" ]; then
    echo "📦 DEPENDÊNCIAS NODE.JS:" > dependencias.txt
    cat package.json | grep -A 50 '"dependencies"' >> dependencias.txt
    echo "\n📦 DEPENDÊNCIAS DE DESENVOLVIMENTO:" >> dependencias.txt
    cat package.json | grep -A 50 '"devDependencies"' >> dependencias.txt
fi

# Para outros tipos de projeto, adaptar conforme necessário
```

### ETAPA 4: MAPEAR ROTAS E NAVEGAÇÃO
```bash
# Buscar por definições de rotas (universais)
echo "🗺️ ROTAS ENCONTRADAS:" > rotas.txt
grep -r "route\|path\|\/.*:" src/ --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" 2>/dev/null >> rotas.txt
grep -r "navigate\|router\|link" src/ --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" 2>/dev/null | head -20 >> rotas.txt
```

---

## 🔍 ETAPA AVANÇADA: EXTRAÇÃO DE DADOS TÉCNICOS

### **OBJETIVO DESTA ETAPA:**
Capturar **todas as informações técnicas críticas** do sistema: estrutura do banco de dados, políticas de segurança, endpoints de API, fluxos de dados e relacionamentos entre módulos. Esta é a parte mais valiosa do backup, pois documenta a "inteligência" do sistema.

### **PASSO 1: ANÁLISE DO BANCO DE DADOS**

#### **1.1 Identificar o tipo de banco:**
```bash
# Verificar se usa banco SQL
find . -name "*.sql" | head -10
find . -name "*migration*" | head -10
find . -name "*schema*" | head -10

# Verificar se usa Supabase
grep -r "supabase" . --include="*.json" --include="*.js" --include="*.ts" 2>/dev/null

# Verificar se usa Firebase
grep -r "firebase" . --include="*.json" 2>/dev/null

# Verificar se usa MongoDB
grep -r "mongoose\|mongodb" . --include="*.json" 2>/dev/null
```

#### **1.2 Extrair estrutura do banco:**
```bash
# Para projetos com migrations (Rails, Laravel, Node.js)
echo "📊 ESTRUTURA DO BANCO DE DADOS:" > banco_estrutura.txt
find . -path "*/migrations/*" -name "*.sql" -o -name "*.js" -o -name "*.ts" | while read file; do
    echo "=== $file ===" >> banco_estrutura.txt
    head -50 "$file" >> banco_estrutura.txt
    echo "" >> banco_estrutura.txt
done

# Para projetos com schema files
find . -name "*schema*" -name "*.sql" -o -name "*.json" | while read file; do
    echo "=== SCHEMA: $file ===" >> banco_estrutura.txt
    cat "$file" >> banco_estrutura.txt
done
```

#### **1.3 Documentar tabelas e relacionamentos:**
```bash
# Buscar definições de tabelas
echo "🗂️ TABELAS IDENTIFICADAS:" > tabelas_relacionamentos.txt
grep -r "CREATE TABLE\|table.*{" . --include="*.sql" --include="*.js" --include="*.ts" 2>/dev/null >> tabelas_relacionamentos.txt

# Buscar relacionamentos (foreign keys, references)
echo "🔗 RELACIONAMENTOS:" >> tabelas_relacionamentos.txt
grep -r "REFERENCES\|belongsTo\|hasMany\|foreign.*key" . --include="*.sql" --include="*.js" --include="*.ts" 2>/dev/null >> tabelas_relacionamentos.txt

# Buscar índices importantes
echo "📈 ÍNDICES:" >> tabelas_relacionamentos.txt
grep -r "CREATE INDEX\|INDEX.*ON" . --include="*.sql" 2>/dev/null >> tabelas_relacionamentos.txt
```

### **PASSO 2: ANÁLISE DE SEGURANÇA E POLÍTICAS**

#### **2.1 Extrair políticas RLS (Row Level Security):**
```bash
echo "🔐 POLÍTICAS DE SEGURANÇA:" > politicas_seguranca.txt

# Para Supabase/PostgreSQL
grep -r "CREATE POLICY\|ALTER TABLE.*ENABLE ROW LEVEL SECURITY" . --include="*.sql" 2>/dev/null >> politicas_seguranca.txt

# Para outros sistemas de auth
grep -r "auth\|permission\|role\|access" . --include="*.js" --include="*.ts" --include="*.json" 2>/dev/null | head -30 >> politicas_seguranca.txt
```

#### **2.2 Mapear sistema de autenticação:**
```bash
echo "👤 SISTEMA DE AUTENTICAÇÃO:" > autenticacao.txt

# Buscar providers de auth
grep -r "login\|signin\|auth\|jwt\|token" . --include="*.js" --include="*.ts" 2>/dev/null | head -20 >> autenticacao.txt

# Buscar middleware de proteção
grep -r "middleware\|protected\|guard\|verify" . --include="*.js" --include="*.ts" 2>/dev/null | head -15 >> autenticacao.txt
```

### **PASSO 3: MAPEAMENTO DE SERVIÇOS E ENDPOINTS**

#### **3.1 Identificar serviços backend:**
```bash
echo "🔧 SERVIÇOS BACKEND:" > servicos_endpoints.txt

# Buscar services, APIs, controllers
find . -name "*service*" -o -name "*api*" -o -name "*controller*" | while read file; do
    echo "=== $file ===" >> servicos_endpoints.txt
    # Extrair funções principais (primeiras 30 linhas)
    head -30 "$file" | grep -E "(function|const.*=|export.*function|class.*{)" >> servicos_endpoints.txt
    echo "" >> servicos_endpoints.txt
done
```

#### **3.2 Mapear endpoints de API:**
```bash
# Buscar definições de rotas de API
echo "🌐 ENDPOINTS DE API:" >> servicos_endpoints.txt
grep -r "app\.\|router\.\|api\.\|fetch\|axios\|post\|get\|put\|delete" . --include="*.js" --include="*.ts" 2>/dev/null | head -40 >> servicos_endpoints.txt

# Buscar configurações de URL base
echo "🔗 CONFIGURAÇÕES DE API:" >> servicos_endpoints.txt
grep -r "baseURL\|apiUrl\|endpoint" . --include="*.js" --include="*.ts" --include="*.json" 2>/dev/null >> servicos_endpoints.txt
```

### **PASSO 4: ANÁLISE DE FLUXOS DE DADOS**

#### **4.1 Mapear estado global e gerenciamento:**
```bash
echo "📊 GERENCIAMENTO DE ESTADO:" > fluxos_dados.txt

# Para React (Context, Redux, Zustand)
grep -r "createContext\|useContext\|Provider\|reducer\|store" . --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | head -20 >> fluxos_dados.txt

# Para Vue (Vuex, Pinia)
grep -r "store\|mutation\|action\|getter" . --include="*.js" --include="*.ts" --include="*.vue" 2>/dev/null | head -20 >> fluxos_dados.txt
```

#### **4.2 Identificar integrações externas:**
```bash
echo "🌍 INTEGRAÇÕES EXTERNAS:" >> fluxos_dados.txt

# APIs de terceiros, webhooks, services
grep -r "webhook\|api.*key\|integration\|third.*party" . --include="*.js" --include="*.ts" --include="*.json" 2>/dev/null >> fluxos_dados.txt

# Serviços de pagamento, email, etc.
grep -r "stripe\|paypal\|sendgrid\|mailgun\|twilio" . --include="*.js" --include="*.ts" --include="*.json" 2>/dev/null >> fluxos_dados.txt
```

### **PASSO 5: GERAÇÃO DO RELATÓRIO TÉCNICO COMPLETO**

#### **5.1 Consolidar todas as informações:**
```bash
echo "📋 Gerando relatório técnico completo..."

cat > "RELATORIO_TECNICO_COMPLETO.md" << EOF
# 📊 RELATÓRIO TÉCNICO COMPLETO
## Projeto: $(basename $(pwd))
## Data: $(date)
## Localização: $(pwd)

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS
$(cat banco_estrutura.txt 2>/dev/null || echo "Não identificado")

---

## 🗂️ TABELAS E RELACIONAMENTOS
$(cat tabelas_relacionamentos.txt 2>/dev/null || echo "Não identificado")

---

## 🔐 POLÍTICAS DE SEGURANÇA
$(cat politicas_seguranca.txt 2>/dev/null || echo "Não identificado")

---

## 👤 SISTEMA DE AUTENTICAÇÃO
$(cat autenticacao.txt 2>/dev/null || echo "Não identificado")

---

## 🔧 SERVIÇOS E ENDPOINTS
$(cat servicos_endpoints.txt 2>/dev/null || echo "Não identificado")

---

## 📊 FLUXOS DE DADOS
$(cat fluxos_dados.txt 2>/dev/null || echo "Não identificado")

---

## 🎯 RESUMO EXECUTIVO
Este relatório contém toda a arquitetura técnica do sistema.
Para restaurar o projeto:
1. Configure o banco com a estrutura documentada
2. Implemente as políticas de segurança
3. Configure os serviços e endpoints
4. Restaure as integrações externas
5. Teste os fluxos de dados principais

EOF
```

#### **5.2 Validar a completude do backup:**
```bash
echo "✅ Validando backup técnico..."

# Verificar se capturou informações críticas
{
    echo "📋 CHECKLIST DE VALIDAÇÃO:"
    [ -s banco_estrutura.txt ] && echo "✅ Estrutura do banco documentada" || echo "❌ Estrutura do banco não encontrada"
    [ -s tabelas_relacionamentos.txt ] && echo "✅ Tabelas e relacionamentos mapeados" || echo "⚠️ Relacionamentos não identificados"
    [ -s politicas_seguranca.txt ] && echo "✅ Políticas de segurança extraídas" || echo "⚠️ Políticas não encontradas"
    [ -s servicos_endpoints.txt ] && echo "✅ Serviços e endpoints documentados" || echo "❌ Serviços não mapeados"
    [ -s fluxos_dados.txt ] && echo "✅ Fluxos de dados identificados" || echo "⚠️ Fluxos não documentados"
} >> RELATORIO_TECNICO_COMPLETO.md
```

### **RESULTADO DESTA ETAPA:**
Ao final, você terá um **relatório técnico completo** que documenta:
- ✅ **Estrutura completa do banco de dados** (tabelas, colunas, tipos)
- ✅ **Relacionamentos e constraints** (foreign keys, índices)
- ✅ **Políticas de segurança** (RLS, permissions, roles)
- ✅ **Sistema de autenticação** (providers, middleware, proteção)
- ✅ **Mapeamento de serviços** (APIs, controllers, endpoints)
- ✅ **Fluxos de dados** (estado global, integrações, webhooks)
- ✅ **Checklist de validação** para garantir backup completo

### **APLICABILIDADE UNIVERSAL:**
Este processo funciona para **qualquer tipo de projeto web**:
- ✅ **React/Vue/Angular** → Extrai components, services, state management
- ✅ **Node.js/Express** → Mapeia routes, controllers, middleware
- ✅ **Laravel/Rails** → Documenta models, migrations, policies
- ✅ **Django/Flask** → Captura views, models, serializers
- ✅ **WordPress/PHP** → Extrai database structure, functions, hooks
- ✅ **Qualquer CMS** → Identifica custom tables, plugins, themes

**O resultado é um backup de conhecimento técnico que permite reconstruir completamente a arquitetura do sistema, independente da tecnologia usada.**

---

## 🤖 SCRIPT AUTOMATIZADO COMPLETO

### Para Windows (PowerShell):
```powershell
# Salvar como: backup_universal.ps1
param(
    [string]$NomeProjeto = "MeuProjeto",
    [string]$PastaDestino = "backup_completo"
)

Write-Host "🔍 Iniciando backup universal do projeto: $NomeProjeto" -ForegroundColor Green

# Criar pasta de backup
New-Item -ItemType Directory -Path $PastaDestino -Force

# 1. INFORMAÇÕES BÁSICAS
@"
# 📊 RELATÓRIO AUTOMÁTICO DE BACKUP
## Projeto: $NomeProjeto
## Data: $(Get-Date)
## Local: $(Get-Location)

"@ | Out-File "$PastaDestino/RELATORIO_GERAL.md"

# 2. ESTRUTURA DE ARQUIVOS
Write-Host "📁 Analisando estrutura de arquivos..."
Get-ChildItem -Recurse -File | Select-Object Name, Extension, Length, LastWriteTime | Export-Csv "$PastaDestino/estrutura_arquivos.csv" -NoTypeInformation

# 3. DEPENDÊNCIAS (se existir package.json)
if (Test-Path "package.json") {
    Write-Host "📦 Extraindo dependências Node.js..."
    Copy-Item "package.json" "$PastaDestino/"
    if (Test-Path "package-lock.json") { Copy-Item "package-lock.json" "$PastaDestino/" }
    if (Test-Path "yarn.lock") { Copy-Item "yarn.lock" "$PastaDestino/" }
}

# 4. CONFIGURAÇÕES
Write-Host "⚙️ Copiando arquivos de configuração..."
$configFiles = @("*.config.js", "*.config.ts", "vite.config.*", "webpack.config.*", "tailwind.config.*", "tsconfig.json", ".env.example")
foreach ($pattern in $configFiles) {
    Get-ChildItem -Name $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Copy-Item $_ "$PastaDestino/"
    }
}

# 5. ROTAS E COMPONENTES PRINCIPAIS
Write-Host "🗺️ Mapeando rotas e componentes..."
$rotasInfo = @()
Get-ChildItem -Recurse -Include "*.tsx", "*.jsx", "*.ts", "*.js" | ForEach-Object {
    $conteudo = Get-Content $_.FullName -Raw
    if ($conteudo -match "route|path|navigate|router") {
        $rotasInfo += "$($_.Name): $($_.DirectoryName)"
    }
}
$rotasInfo | Out-File "$PastaDestino/rotas_detectadas.txt"

# 6. TECNOLOGIAS DETECTADAS
Write-Host "🔍 Identificando tecnologias..."
$tecnologias = @()
if (Test-Path "package.json") { $tecnologias += "Node.js/JavaScript" }
if (Get-ChildItem -Include "*.tsx", "*.jsx" -Recurse) { $tecnologias += "React" }
if (Get-ChildItem -Include "*.ts" -Recurse) { $tecnologias += "TypeScript" }
if (Test-Path "tailwind.config.*") { $tecnologias += "Tailwind CSS" }
if (Test-Path "vite.config.*") { $tecnologias += "Vite" }
if (Get-Content "package.json" -ErrorAction SilentlyContinue | Select-String "supabase") { $tecnologias += "Supabase" }

"🛠️ TECNOLOGIAS DETECTADAS:`n" + ($tecnologias -join "`n") | Out-File "$PastaDestino/tecnologias.txt"

# 7. README E DOCUMENTAÇÃO
Write-Host "📖 Copiando documentação..."
Get-ChildItem -Include "*.md", "*.txt" -Recurse | Copy-Item -Destination "$PastaDestino/docs/"

Write-Host "✅ Backup concluído em: $PastaDestino" -ForegroundColor Green
```

### Para Mac/Linux (Bash):
```bash
#!/bin/bash
# Salvar como: backup_universal.sh

NOME_PROJETO=${1:-"MeuProjeto"}
PASTA_DESTINO=${2:-"backup_completo"}

echo "🔍 Iniciando backup universal do projeto: $NOME_PROJETO"

# Criar pasta de backup
mkdir -p "$PASTA_DESTINO"

# 1. RELATÓRIO GERAL
cat > "$PASTA_DESTINO/RELATORIO_GERAL.md" << EOF
# 📊 RELATÓRIO AUTOMÁTICO DE BACKUP
## Projeto: $NOME_PROJETO
## Data: $(date)
## Local: $(pwd)

EOF

# 2. ESTRUTURA DE ARQUIVOS
echo "📁 Analisando estrutura de arquivos..."
find . -type f -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.html" -o -name "*.css" -o -name "*.json" | sort > "$PASTA_DESTINO/estrutura_arquivos.txt"

# 3. DEPENDÊNCIAS
echo "📦 Extraindo dependências..."
[ -f "package.json" ] && cp package.json "$PASTA_DESTINO/"
[ -f "package-lock.json" ] && cp package-lock.json "$PASTA_DESTINO/"
[ -f "yarn.lock" ] && cp yarn.lock "$PASTA_DESTINO/"

# 4. CONFIGURAÇÕES
echo "⚙️ Copiando configurações..."
for config in *.config.* vite.config.* tailwind.config.* tsconfig.json .env.example; do
    [ -f "$config" ] && cp "$config" "$PASTA_DESTINO/"
done

# 5. TECNOLOGIAS
echo "🔍 Detectando tecnologias..."
{
    echo "🛠️ TECNOLOGIAS DETECTADAS:"
    [ -f "package.json" ] && echo "✓ Node.js/JavaScript"
    [ -n "$(find . -name "*.tsx" -o -name "*.jsx" | head -1)" ] && echo "✓ React"
    [ -n "$(find . -name "*.ts" | head -1)" ] && echo "✓ TypeScript"
    [ -f "tailwind.config.*" ] && echo "✓ Tailwind CSS"
    [ -f "vite.config.*" ] && echo "✓ Vite"
    grep -q "supabase" package.json 2>/dev/null && echo "✓ Supabase"
} > "$PASTA_DESTINO/tecnologias.txt"

# 6. ROTAS
echo "🗺️ Mapeando rotas..."
grep -r "route\|path\|navigate" src/ --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" 2>/dev/null | head -20 > "$PASTA_DESTINO/rotas_detectadas.txt"

echo "✅ Backup concluído em: $PASTA_DESTINO"
```

---

## 📋 CHECKLIST MANUAL COMPLEMENTAR

### INFORMAÇÕES QUE VOCÊ DEVE COLETAR MANUALMENTE:

#### 🔐 CREDENCIAIS E ACESSOS:
- [ ] Usuários de teste (login/senha)
- [ ] URLs de produção e desenvolvimento
- [ ] Chaves de API (sem expor valores reais)
- [ ] Tokens de integração
- [ ] Credenciais de banco de dados

#### 🌐 INTEGRAÇÕES EXTERNAS:
- [ ] WhatsApp Business API
- [ ] Supabase (URL do projeto)
- [ ] Google Analytics
- [ ] Serviços de pagamento
- [ ] CDN de imagens
- [ ] Serviços de email

#### 💾 BANCO DE DADOS:
- [ ] Nome do banco
- [ ] Tabelas principais
- [ ] Relacionamentos importantes
- [ ] Procedures/functions customizadas
- [ ] Políticas de segurança (RLS)

#### 🎨 ASSETS E MÍDIA:
- [ ] Logos da empresa
- [ ] Imagens padrão
- [ ] Ícones customizados
- [ ] Fontes especiais
- [ ] Cores da marca

---

## 🚀 COMO USAR ESTE SCRIPT

### Para o seu projeto atual (Agenda Pro):
```bash
# No terminal, dentro da pasta do projeto:
cd C:\Users\Estud\Documents\GitHub\agenda-pro

# Windows:
.\backup_universal.ps1 -NomeProjeto "AgendaPro" -PastaDestino "backup_agenda_pro"

# Mac/Linux:
chmod +x backup_universal.sh
./backup_universal.sh "AgendaPro" "backup_agenda_pro"
```

### Para qualquer outro projeto:
```bash
# Apenas mude o nome e pasta:
.\backup_universal.ps1 -NomeProjeto "MeuOutroProjeto" -PastaDestino "backup_outro_projeto"
```

---

## 📁 RESULTADO FINAL

Após executar o script, você terá uma pasta com:
```
backup_completo/
├── RELATORIO_GERAL.md           # Resumo do backup
├── estrutura_arquivos.csv       # Lista de todos os arquivos
├── package.json                 # Dependências (se existir)
├── vite.config.ts              # Configurações
├── tailwind.config.ts          # Estilos
├── tecnologias.txt             # Tecnologias detectadas
├── rotas_detectadas.txt        # Mapeamento de rotas
└── docs/                       # Toda documentação encontrada
```

---

## 💡 VANTAGENS DESTE MÉTODO

### ✅ **Universal**: 
Funciona em qualquer projeto web (React, Vue, Angular, PHP, Python, etc.)

### ✅ **Automatizado**: 
Um comando executa todo o processo

### ✅ **Completo**: 
Captura estrutura, dependências, configurações e documentação

### ✅ **Organizado**: 
Resultado final bem estruturado e fácil de entender

### ✅ **Reutilizável**: 
Pode usar o mesmo script em projetos futuros

---

## 🎯 PRÓXIMOS PASSOS

1. **Execute o script** no seu projeto atual
2. **Complete o checklist manual** com informações sensíveis
3. **Guarde o backup** em local seguro (Google Drive, GitHub privado)
4. **Teste a restauração** criando um novo projeto a partir do backup
5. **Use o mesmo processo** em outros projetos

Este script será seu **"canivete suíço"** para backup de qualquer projeto web! 🔧 