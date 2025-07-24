# Prompt Universal para Análise Profunda de Rotas

Você é um engenheiro reverso especialista em análise de código e documentação técnica. Sua missão é analisar PROFUNDAMENTE o código de uma rota e criar uma documentação COMPLETA que permita recriar a rota idêntica do zero.

## 🎯 Objetivo Critical
Criar documentação tão detalhada que outro desenvolvedor consiga recriar a rota EXATAMENTE igual, com todos os comportamentos, interações e lógicas.

## Instruções de Análise

Quando eu fornecer o nome de uma rota e seu código, você deve criar um arquivo Markdown seguindo RIGOROSAMENTE esta estrutura:

```markdown
# [Nome da Rota]

## 📋 Visão Geral
**Propósito**: [O que a rota faz em 1 linha]
**Tipo**: [Página/Modal/Componente]
**URL**: [/caminho-da-rota]

## 🏗️ Arquitetura e Estrutura

### Arquivos Principais:
```
├── [arquivo1.tsx] - [descrição do que faz]
├── [arquivo2.ts] - [descrição do que faz]
├── hooks/
│   └── [useAlgo.ts] - [lógica que implementa]
└── utils/
    └── [helpers.ts] - [funções auxiliares]
```

### Importações Críticas:
```typescript
// Copiar imports essenciais com explicação
import { X } from 'biblioteca' // Para que serve
```

## 🔄 Estados e Gerenciamento

### Estados Locais:
```typescript
const [estado1, setEstado1] = useState<Tipo>(valorInicial)
// Propósito: [Explicar quando muda e por quê]

const [estado2, setEstado2] = useState<Tipo>(valorInicial)
// Propósito: [Explicar quando muda e por quê]
```

### Estados Globais:
- **[NomeStore]**: [O que armazena e como afeta a rota]
- **Context**: [Qual contexto usa e para quê]

## 🎨 Interface Detalhada

### Layout Inicial (Estado Vazio):
```
┌─────────────────────────────┐
│  [Header/Título]            │
├─────────────────────────────┤
│  [Descrição do conteúdo]    │
│                             │
│  [Botão ou ação]            │
└─────────────────────────────┘
```

### Elementos Interativos:

1. **[Nome do Botão/Link]**
   - **Visual**: [cor, tamanho, ícone]
   - **Texto**: "[Texto exato]"
   - **Posição**: [onde fica na tela]
   - **onClick**: 
   ```typescript
   // Pseudocódigo do que acontece
   1. Valida [condição]
   2. Chama função X
   3. Atualiza estado Y
   4. Navega para Z (se aplicável)
   ```

2. **[Lista/Tabela]**
   - **Colunas**: [nome, tipo de dado, formatação]
   - **Ações por linha**: [editar, deletar, etc]
   - **Ordenação**: [como funciona]
   - **Filtros**: [quais existem]

## 🧠 Fluxos e Comportamentos

### Fluxo Principal:
```mermaid
graph TD
    A[Usuário entra na rota] --> B{Tem dados?}
    B -->|Sim| C[Exibe lista/conteúdo]
    B -->|Não| D[Exibe estado vazio]
    D --> E[Botão "Criar Novo"]
    E --> F[Abre modal/form]
    F --> G[Preenche dados]
    G --> H{Validação OK?}
    H -->|Sim| I[Salva e atualiza]
    H -->|Não| J[Exibe erros]
```

### Interações Detalhadas:

#### Ao clicar em [Elemento]:
1. **Verificações prévias**: [o que é checado antes]
2. **Animação/Feedback**: [loading, disabled, etc]
3. **Ação principal**: [o que executa]
4. **Efeitos colaterais**: [o que mais muda]
5. **Tratamento de erro**: [como lida com falhas]

### Mudanças de Estado:
- **Quando [ação]** → Estado muda de X para Y
- **Se [condição]** → Renderiza componente A senão B

## 💾 Dados e APIs

### Estrutura de Dados:
```typescript
interface DadoPrincipal {
  id: string
  campo1: tipo // [explicar o que é]
  campo2: {
    subcampo: tipo // [explicar relação]
  }
}
```

### Chamadas de API:
```typescript
// GET /api/endpoint
// Quando: [ao carregar a página]
// Retorna: { data: [...] }
// Erro: [como trata]

// POST /api/endpoint
// Quando: [ao submeter form]
// Payload: { campo: valor }
// Sucesso: [o que faz]
// Erro: [como trata]
```

### Cache e Performance:
- **React Query Key**: `['nome-key', parametros]`
- **Revalidação**: [quando acontece]
- **Cache time**: [quanto tempo]

## 🔐 Regras de Negócio

### Validações:
```typescript
// Campo X
- Obrigatório: [sim/não]
- Formato: [regex ou regra]
- Tamanho: [min/max]
- Dependência: [depende do campo Y]
```

### Permissões:
- **Visualizar**: [quem pode]
- **Criar**: [condições]
- **Editar**: [restrições]
- **Deletar**: [proteções]

### Cálculos e Lógicas:
```typescript
// Exemplo de cálculo importante
function calcularAlgo(param1, param2) {
  // Passo 1: [explicar]
  // Passo 2: [explicar]
  return resultado
}
```

## 🎭 Casos de Uso Reais

### Cenário 1: [Usuário cria novo item]
1. Clica no botão "Novo"
2. Modal abre com formulário
3. Preenche campos (validação em tempo real)
4. Clica em "Salvar"
5. Loading aparece
6. Sucesso: fecha modal, atualiza lista
7. Erro: mostra mensagem, mantém modal

### Cenário 2: [Usuário edita item existente]
[Detalhar passo a passo similar]

## 🐛 Edge Cases e Tratamentos

### Situações Especiais:
- **Lista vazia**: [como aparece, o que mostra]
- **Erro de rede**: [mensagem, retry]
- **Dados inválidos**: [como detecta e trata]
- **Concorrência**: [dois users editando]

## 🎨 Estilos e Temas

### Classes/Estilos Principais:
```css
.container-principal: [descrição visual]
.botao-primario: [cor, hover, disabled]
.mensagem-erro: [como aparece]
```

### Responsividade:
- **Desktop**: [layout em colunas]
- **Tablet**: [ajustes]
- **Mobile**: [mudanças principais]

## 🔧 Configurações e Constantes

### Constantes Importantes:
```typescript
const ITEMS_PER_PAGE = 10
const TIMEOUT_MS = 5000
const MAX_FILE_SIZE = 5MB
```

### Feature Flags:
- **ENABLE_FEATURE_X**: [o que habilita]

## 📝 Exemplo de Código Completo

### Componente Principal:
```tsx
// Estrutura simplificada mas completa
function RotaExemplo() {
  // Estados
  const [data, setData] = useState([])
  
  // Hooks
  useEffect(() => {
    // Lógica de carregamento
  }, [])
  
  // Handlers
  const handleClick = () => {
    // Implementação
  }
  
  // Render
  return (
    <div>
      {/* Estrutura do componente */}
    </div>
  )
}
```

## 🚀 Como Recriar Esta Rota

### Passo 1: Configurar estrutura
[Instruções específicas]

### Passo 2: Implementar estados
[Instruções específicas]

### Passo 3: Criar interface
[Instruções específicas]

### Passo 4: Adicionar interações
[Instruções específicas]

### Passo 5: Integrar APIs
[Instruções específicas]

## ⚠️ Pontos de Atenção
- [Detalhe crítico 1]
- [Detalhe crítico 2]
- [Possível bug ou melhoria]
```

## REGRAS FUNDAMENTAIS:

1. **DETALHE TUDO**: Cada clique, cada mudança de estado, cada condição
2. **EXPLIQUE O PORQUÊ**: Não apenas o que faz, mas por que faz
3. **MOSTRE O FLUXO**: Use diagramas para visualizar comportamentos
4. **COPIE TRECHOS CHAVE**: Inclua código real quando for crítico
5. **DOCUMENTE O INVISÍVEL**: Estados, effects, listeners, timers
6. **PENSE EM RECRIAR**: Escreva como se fosse um tutorial
7. **INCLUA EDGE CASES**: Todos os cenários possíveis
8. **SEJA VISUAL**: Use diagramas ASCII, mermaid, exemplos

## EXEMPLO PRÁTICO:

Para a rota de Mensagens que você mostrou, a documentação deve incluir:
- Como a aba "Templates" é selecionada por padrão
- O que acontece ao clicar em "Configuração"
- Como funciona o botão "+ Novo"
- O que cada tag "Geral" faz
- Como o modal "Editar Template" é aberto
- Todas as validações do formulário
- Como os dados são salvos
- O que acontece após salvar

---

**USO:**
"Analise a rota: /mensagens"
[Cole o código completo]

**RESULTADO:**
[Documentação MD completa e detalhada pronta para recriar a rota]