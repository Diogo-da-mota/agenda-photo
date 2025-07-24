# 📋 PROMPT PARA CURSOR - DOCUMENTAÇÃO COMPLETA DO PROJETO

Quero que você analise **TODO O PROJETO** e atualize o arquivo `ESTRUTURA-COMPLETA.md` com informações detalhadas e precisas.

## 🎯 OBJETIVO PRINCIPAL
Criar um documento de referência COMPLETO que contenha toda a arquitetura, fluxos, componentes, serviços, banco de dados e funcionalidades do site para resolver erros rapidamente.

## 🔍 ANÁLISE OBRIGATÓRIA - FAÇA UMA VARREDURA COMPLETA EM:

### 📁 1. ESTRUTURA DE ARQUIVOS E PASTAS
- Mapeie TODA a estrutura de pastas do projeto
- Liste todos os arquivos importantes (.tsx, .ts, .js, .css, etc.)
- Identifique a hierarquia e organização do código
- Inclua dependências do package.json

### 🛣️ 2. SISTEMA DE ROTAS
- Analise `App.tsx`, `routes.tsx` ou arquivos de roteamento
- Liste TODAS as rotas disponíveis (/, /login, /dashboard, etc.)
- Identifique rotas protegidas vs públicas
- Mapeie parâmetros de rota (ex: /produto/:id)
- Documente redirects e guards de rota

### 🧩 3. COMPONENTES E PÁGINAS
Para CADA página/componente, documente:
- Nome do arquivo e localização
- Props que recebe
- Estados internos (useState, useContext)
- Hooks utilizados (useEffect, custom hooks)
- Componentes filhos utilizados
- Funcionalidades principais
- Integrações com serviços/APIs

### 🔧 4. SERVIÇOS E UTILITÁRIOS
- Liste todos os serviços (ex: authService, apiService, etc.)
- Funções utilitárias importantes
- Configurações de API
- Interceptors e middlewares
- Validações e schemas

### 🗄️ 5. BANCO DE DADOS SUPABASE (ANÁLISE PROFUNDA)
Analise e documente:
- **Tabelas**: Nome, estrutura de colunas, tipos de dados
- **Relacionamentos**: Foreign keys, joins utilizados
- **Políticas RLS**: Para cada tabela, liste as policies
- **Triggers**: Se houver, documente
- **Functions**: Funções do banco personalizadas
- **Views**: Se existirem
- **Indexes**: Índices criados
- **Storage**: Buckets e políticas de storage

### 🔐 6. AUTENTICAÇÃO E AUTORIZAÇÃO
- Sistema de login/logout
- Gerenciamento de sessão
- Tipos de usuário/roles
- Proteção de rotas
- Verificação de permissões

### 📡 7. INTEGRAÇÕES E APIs
- APIs externas utilizadas
- Configurações de ambiente (.env)
- Webhooks
- Serviços de terceiros

### 🎨 8. ESTILOS E UI
- Sistema de design utilizado (Tailwind, CSS modules, etc.)
- Temas e variáveis CSS
- Componentes de UI reutilizáveis
- Responsividade

## 📝 ESTRUTURA DO ARQUIVO ESTRUTURA-COMPLETA.md

Organize o documento assim:

```markdown
# 🏗️ ESTRUTURA COMPLETA DO PROJETO

## 📂 1. ÁRVORE DE ARQUIVOS
[Estrutura visual completa das pastas]

## 🛣️ 2. MAPEAMENTO DE ROTAS
### Rotas Públicas
- `/` - Home
  - Componente: Home.tsx
  - Funcionalidades: [listar]
  - Serviços utilizados: [listar]
  
### Rotas Protegidas
- `/dashboard` - Dashboard
  - Componente: Dashboard.tsx
  - Autenticação: Requer login
  - Permissões: [especificar]

## 🧩 3. COMPONENTES DETALHADOS
### Componente: Header.tsx
- **Localização**: src/components/Header.tsx
- **Props**: { user: User, onLogout: () => void }
- **Estados**: isMenuOpen: boolean
- **Funcionalidades**: 
  - Navegação principal
  - Menu mobile
  - Logout de usuário
- **Integrações**: authService.logout()

## 🗄️ 4. BANCO DE DADOS SUPABASE

### Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
**Políticas RLS**:
- users_select_own: Usuários podem ver apenas seus dados
- users_update_own: Usuários podem atualizar apenas seus dados

### Tabela: projects
[Estrutura e políticas]

## 🔧 5. SERVIÇOS E UTILITÁRIOS
### authService.ts
- login(email, password)
- logout()
- getCurrentUser()
- updateProfile(data)

## 🔐 6. AUTENTICAÇÃO
- **Provedor**: Supabase Auth
- **Fluxo**: Email/Password + Social Login
- **Proteção**: HOC withAuth(), useAuth() hook

## 📡 7. INTEGRAÇÕES
- **Supabase**: Banco de dados e autenticação
- **APIs Externas**: [listar se houver]

## 🎨 8. SISTEMA DE ESTILOS
- **Framework**: Tailwind CSS
- **Temas**: Light/Dark mode
- **Componentes UI**: [listar biblioteca utilizada]

## 🔄 9. FLUXOGRAMA DE NAVEGAÇÃO
```
📱 FLUXO PRINCIPAL:
/ (Home) 
  ↓
/login → /dashboard 
          ↓
       /profile ← → /settings
          ↓
       /projects → /project/:id
```

## ⚠️ 10. PONTOS CRÍTICOS E DEPENDÊNCIAS
- **Autenticação**: Todas as rotas /dashboard/* dependem de usuário logado
- **Supabase**: Conexão essencial para funcionamento
- **Variáveis ENV**: [listar variáveis críticas]

## 🐛 11. PROBLEMAS CONHECIDOS E SOLUÇÕES
[Documente erros comuns e suas soluções]
```

## ⚡ INSTRUÇÕES ESPECÍFICAS PARA O CURSOR:

1. **SEJA EXTREMAMENTE DETALHADO** - Não pule nenhum arquivo importante
2. **ANALISE O CÓDIGO REAL** - Não invente informações, leia o código
3. **INCLUA EXEMPLOS DE CÓDIGO** - Especialmente para funções críticas
4. **DOCUMENTE DEPENDÊNCIAS** - O que quebra se X parar de funcionar
5. **MAPEIE FLUXOS DE DADOS** - Como os dados fluem entre componentes
6. **IDENTIFIQUE GARGALOS** - Pontos únicos de falha
7. **LISTE TODAS AS TABELAS** - Com estrutura completa e relacionamentos
8. **DOCUMENTE POLÍTICAS RLS** - Essencial para debugging de permissões

## 🚨 ATENÇÃO ESPECIAL PARA:
- Configurações do Supabase (supabase.ts)
- Tipos TypeScript (interfaces e types)
- Context Providers e seus valores
- Custom Hooks e sua lógica
- Validações de formulário
- Tratamento de erros
- Loading states e UX

**RESULTADO ESPERADO**: Um documento que me permita entender COMPLETAMENTE o projeto e resolver qualquer erro rapidamente, mesmo depois de semanas sem mexer no código.