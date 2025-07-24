## INSTRUÇÕES PARA USO DESTE TEMPLATE

Este arquivo serve como backup estruturado e referência completa para reconstrução de qualquer menu da sidebar. Atualize as seções conforme necessário e use como fonte única de verdade para o Cursor.

---

## 1. IDENTIFICAÇÃO DO PROJETO

**Nome do Projeto:** [INSERIR NOME]
**Versão Atual:** [INSERIR VERSÃO]
**Data da Última Atualização:** [DATA]
**Responsável:** [NOME]
**Menu/Seção Específica:** [QUAL MENU DA SIDEBAR]

---

## 2. ESTRUTURA DA SIDEBAR

### Hierarquia de Menus
- **Menu Principal:** [NOME DO MENU]
  - Submenu 1: [NOME E DESCRIÇÃO]
  - Submenu 2: [NOME E DESCRIÇÃO]
  - Submenu 3: [NOME E DESCRIÇÃO]

### Posição na Sidebar
- **Ordem de Exibição:** [POSIÇÃO NUMÉRICA]
- **Ícone Utilizado:** [DESCRIÇÃO DO ÍCONE]
- **Estado Padrão:** [EXPANDIDO/COLAPSADO]
- **Permissões Necessárias:** [QUAIS USUÁRIOS PODEM VER]

---

## 3. MAPEAMENTO COMPLETO DE ROTAS

### Rota Principal
- **URL Base:** [/caminho-principal]
- **Componente Raiz:** [NOME DO COMPONENTE]
- **Layout Utilizado:** [QUAL LAYOUT]

### Sub-rotas e Navegação
- **Rota 1:** [/caminho/sub1] - [DESCRIÇÃO DA FUNCIONALIDADE]
- **Rota 2:** [/caminho/sub2] - [DESCRIÇÃO DA FUNCIONALIDADE]
- **Rota 3:** [/caminho/sub3] - [DESCRIÇÃO DA FUNCIONALIDADE]

### Parâmetros de URL
- **Parâmetros Dinâmicos:** [id, slug, categoria, etc.]
- **Query Parameters:** [filtros, ordenação, paginação]
- **Estados de URL:** [como a URL reflete o estado da aplicação]

---

## 4. ESQUEMA DO SUPABASE

### Tabelas Principais
**Tabela 1: [NOME_DA_TABELA]**
- **Propósito:** [PARA QUE SERVE ESTA TABELA]
- **Campos Principais:**
  - id: [TIPO E DESCRIÇÃO]
  - campo_1: [TIPO E DESCRIÇÃO]
  - campo_2: [TIPO E DESCRIÇÃO]
  - created_at: [TIMESTAMP]
  - updated_at: [TIMESTAMP]

**Tabela 2: [NOME_DA_TABELA]**
- **Propósito:** [PARA QUE SERVE ESTA TABELA]
- **Campos Principais:**
  - [REPETIR ESTRUTURA ACIMA]

### Relacionamentos
- **Tabela A relaciona com Tabela B:** [TIPO DE RELAÇÃO - 1:1, 1:N, N:N]
- **Chaves Estrangeiras:** [QUAIS CAMPOS FAZEM A LIGAÇÃO]
- **Índices Importantes:** [CAMPOS INDEXADOS PARA PERFORMANCE]

### Policies (RLS)
- **Política de Leitura:** [QUEM PODE LER OS DADOS]
- **Política de Escrita:** [QUEM PODE MODIFICAR OS DADOS]
- **Filtros por Usuário:** [COMO OS DADOS SÃO FILTRADOS POR USUÁRIO]

---

## 5. FUNCIONALIDADES PRINCIPAIS

### Operações CRUD
- **Create:** [COMO E ONDE NOVOS REGISTROS SÃO CRIADOS]
- **Read:** [COMO OS DADOS SÃO LISTADOS E EXIBIDOS]
- **Update:** [ONDE E COMO OS DADOS SÃO EDITADOS]
- **Delete:** [PROCESSO DE EXCLUSÃO E SOFT DELETE]

### Filtros e Busca
- **Filtros Disponíveis:** [QUAIS FILTROS O USUÁRIO PODE APLICAR]
- **Sistema de Busca:** [CAMPOS PESQUISÁVEIS E LÓGICA]
- **Ordenação:** [CAMPOS QUE PERMITEM ORDENAÇÃO]

### Paginação
- **Tipo de Paginação:** [INFINITA, NUMERADA, LOAD MORE]
- **Itens por Página:** [QUANTIDADE PADRÃO]
- **Performance:** [COMO É OTIMIZADA A CONSULTA]

---

## 6. ESTADOS E DADOS

### Estados Globais
- **Estado Principal:** [QUAL ESTADO GERENCIA ESTE MENU]
- **Dados Compartilhados:** [QUAIS DADOS SÃO COMPARTILHADOS COM OUTROS MENUS]
- **Cache:** [ESTRATÉGIA DE CACHE DOS DADOS]

### Estados Locais
- **Formulários:** [ESTADOS DOS FORMULÁRIOS DA SEÇÃO]
- **Modais:** [ESTADOS DE ABERTURA/FECHAMENTO DE MODAIS]
- **Loading:** [ESTADOS DE CARREGAMENTO]

### Validações
- **Validações de Frontend:** [REGRAS DE VALIDAÇÃO NO CLIENTE]
- **Validações de Backend:** [REGRAS NO SUPABASE]
- **Mensagens de Erro:** [TIPOS DE ERROS E SUAS MENSAGENS]

---

## 7. COMPONENTES PRINCIPAIS

### Componente de Lista
- **Responsabilidade:** [O QUE ESTE COMPONENTE FAZ]
- **Props Recebidas:** [QUAIS PROPRIEDADES RECEBE]
- **Estados Internos:** [ESTADOS QUE GERENCIA]

### Componente de Formulário
- **Campos do Formulário:** [LISTA DE TODOS OS CAMPOS]
- **Validações:** [REGRAS DE VALIDAÇÃO]
- **Submissão:** [COMO OS DADOS SÃO ENVIADOS]

### Componentes de UI
- **Tabelas:** [ESTRUTURA DAS TABELAS]
- **Cards:** [COMO OS DADOS SÃO EXIBIDOS EM CARDS]
- **Modais:** [TIPOS DE MODAIS UTILIZADOS]

---

## 8. INTEGRAÇÕES E APIS

### APIs do Supabase
- **Consultas Principais:** [PRINCIPAIS QUERIES UTILIZADAS]
- **Mutations:** [OPERAÇÕES DE MODIFICAÇÃO]
- **Subscriptions:** [DADOS EM TEMPO REAL]

### APIs Externas
- **Integrações:** [APIS EXTERNAS UTILIZADAS]
- **Autenticação:** [COMO A AUTH É GERENCIADA]
- **Rate Limits:** [LIMITAÇÕES A CONSIDERAR]

---

## 9. PROBLEMAS CONHECIDOS E SOLUÇÕES

### Bugs Recorrentes
- **Problema 1:** [DESCRIÇÃO DO PROBLEMA]
  - **Solução:** [COMO RESOLVER]
  - **Prevenção:** [COMO EVITAR]

- **Problema 2:** [DESCRIÇÃO DO PROBLEMA]
  - **Solução:** [COMO RESOLVER]
  - **Prevenção:** [COMO EVITAR]

### Limitações Técnicas
- **Performance:** [GARGALOS CONHECIDOS]
- **Escalabilidade:** [PONTOS DE ATENÇÃO]
- **Browser Compatibility:** [PROBLEMAS EM NAVEGADORES ESPECÍFICOS]

---

## 10. INSTRUÇÕES PARA O CURSOR

### Para Reconstrução Completa
1. **Primeiro:** Verificar a estrutura de dados no Supabase conforme seção 4
2. **Segundo:** Criar as rotas conforme mapeamento da seção 3
3. **Terceiro:** Implementar componentes seguindo a estrutura da seção 7
4. **Quarto:** Configurar estados conforme seção 6
5. **Quinto:** Implementar funcionalidades da seção 5

### Para Correções Pontuais
- **Se for problema de dados:** Consultar seções 4 e 8
- **Se for problema de navegação:** Consultar seção 3
- **Se for problema de UI:** Consultar seção 7
- **Se for problema conhecido:** Consultar seção 9

### Padrões de Código
- **Nomenclatura:** [PADRÕES DE NOMES UTILIZADOS]
- **Estrutura de Arquivos:** [COMO OS ARQUIVOS ESTÃO ORGANIZADOS]
- **Conventions:** [CONVENÇÕES ESPECÍFICAS DO PROJETO]

---

## 11. CHECKLIST DE ATUALIZAÇÃO

### Quando Atualizar Este Arquivo
- [ ] Nova rota foi adicionada
- [ ] Tabela do Supabase foi modificada
- [ ] Novo componente foi criado
- [ ] Funcionalidade foi alterada
- [ ] Bug foi resolvido
- [ ] Nova integração foi adicionada

### Validação Pós-Atualização
- [ ] Todas as rotas estão documentadas
- [ ] Schema do Supabase está atualizado
- [ ] Componentes principais estão listados
- [ ] Problemas conhecidos estão documentados
- [ ] Instruções estão claras para o Cursor

---

**IMPORTANTE:** Este arquivo deve ser mantido sempre atualizado e servir como fonte única de verdade para reconstrução de qualquer parte do sistema. Quando fizer alterações no código, lembre-se de atualizar este backup correspondentemente.