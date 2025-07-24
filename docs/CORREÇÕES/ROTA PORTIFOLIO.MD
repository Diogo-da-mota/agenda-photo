# Análise Profunda e Otimização da Rota /Portfolio

## 1. Resumo Executivo

A funcionalidade do portfólio está bem estruturada, utilizando uma arquitetura moderna com hooks customizados e a biblioteca TanStack Query (React Query) para gerenciamento de estado, cache e mutações. A implementação de **updates otimistas** para criar e excluir trabalhos é um destaque, oferecendo uma experiência de usuário fluida.

No entanto, foram identificadas **oportunidades críticas de melhoria** que impactam a performance, a manutenibilidade e a escalabilidade da rota.

- **Principais Problemas Encontrados:**
  1.  **Busca Client-Side Ineficiente:** A funcionalidade de busca filtra os dados no navegador, o que causa lentidão com um grande volume de trabalhos.
  2.  **Componente Monolítico:** A página principal (`Portfolio.tsx`) possui mais de 370 linhas e mistura a lógica de renderização da lista com a estrutura da página, dificultando a manutenção.
  3.  **Estrutura de Arquivos Convoluta:** A organização dos hooks com múltiplos arquivos de reexportação (barrel files) torna a navegação e o entendimento do código desnecessariamente complexos.
  4.  **Código Morto e Resquícios:** Há código relacionado a uma funcionalidade de `placeholders` que não é mais utilizada.

- **Impacto no Projeto:**
  - **Performance:** A busca client-side degrada a experiência do usuário à medida que o número de trabalhos aumenta.
  - **Manutenibilidade:** Componentes grandes são mais difíceis de ler, modificar e testar.
  - **Experiência do Desenvolvedor (DX):** A estrutura de arquivos complexa aumenta o tempo necessário para encontrar e entender a lógica.

- **Prioridade de Correção:** **Alta**. A refatoração da busca é essencial para a escalabilidade da aplicação.

## 2. Plano de Implementação (Priorizado)

| Prioridade | Ação                                           | Arquivos Afetados                                                                                             | Esforço | Benefícios Esperados                                            |
| :--------: | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :------ | :-------------------------------------------------------------- |
| **ALTA**   | **Refatorar busca para server-side**           | `Portfolio.tsx`, `useInfinitePortfolio.tsx`, `portfolioService.ts`                                            | Médio   | **Performance, Escalabilidade**                                 |
| **ALTA**   | **Extrair `PortfolioCard` para componente**    | `Portfolio.tsx`, `src/components/portfolio/PortfolioCard.tsx` (novo)                                          | Baixo   | **Manutenibilidade, Reutilização, Legibilidade**                |
| **MÉDIA**  | **Melhorar UI de confirmação de exclusão**     | `Portfolio.tsx`                                                                                               | Baixo   | **Experiência do Usuário (UX)**                                 |
| **BAIXA**  | **Limpar código morto (placeholders)**         | `Portfolio.tsx`                                                                                               | Baixo   | **Qualidade de Código, Manutenibilidade**                       |
| **BAIXA**  | **Simplificar estrutura de exportação de hooks** | `usePortfolio.tsx`, `portfolio/index.ts`                                                                      | Baixo   | **Experiência do Desenvolvedor (DX)**                           |

---

## 3. Detalhamento dos Problemas e Sugestões

### 3.1 Busca Client-Side (Performance) - **Prioridade Alta**

- **Localização:** `src/pages/Dashboard/Portfolio.tsx` (linhas 130-140)
- **Problema:** A filtragem dos trabalhos é feita com `trabalhos.filter(...)` após todos os dados serem carregados para o navegador. Isso não escala.
- **Código Problemático (`Portfolio.tsx`):**
  ```typescript
  const trabalhosFiltrados = useMemo(() => {
    const lista = trabalhos;
    if (!searchTerm) return lista;
    return lista.filter(trabalho =>
      trabalho.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // ... outras condições
    );
  }, [trabalhos, searchTerm]);
  ```
- **Sugestão de Refatoração:**
  1.  **Modificar o Serviço:** Atualizar `buscarTrabalhosPortfolioOtimizado` em `portfolioService.ts` para aceitar um parâmetro `searchTerm` e incluir a lógica de filtro na query do Supabase.
  2.  **Atualizar o Hook de Busca:** Em `useInfinitePortfolio.tsx`, passar o `searchTerm` para o serviço e adicioná-lo à `queryKey` do `useInfiniteQuery` para que o cache funcione por termo de busca.
      ```typescript
      // Em useInfinitePortfolio.tsx
      export const useInfinitePortfolio = (pageSize: number = 12, searchTerm: string) => {
        // ...
        const { data } = useInfiniteQuery({
          queryKey: [PORTFOLIO_QUERY_KEY, 'paginado', pageSize, searchTerm], // Adicionar searchTerm
          queryFn: async ({ pageParam = 1 }) => {
            return await buscarTrabalhosPortfolioOtimizado(user.id, pageParam, pageSize, searchTerm); // Passar para o serviço
          },
          // ...
        });
      }
      ```
  3.  **Ajustar a Página:** Em `Portfolio.tsx`, usar `useDebounce` no `searchTerm` para evitar chamadas excessivas à API enquanto o usuário digita e passar o termo debotado para o hook `usePortfolioPaginado`.

- **Benefícios:** A busca será drasticamente mais rápida, independentemente do número de trabalhos. A carga inicial de dados será menor.

### 3.2 Componente Monolítico (Manutenibilidade) - **Prioridade Alta**

- **Localização:** `src/pages/Dashboard/Portfolio.tsx` (linhas 235-270)
- **Problema:** A lógica de renderização do card de cada trabalho está acoplada à página principal, aumentando a complexidade do arquivo.
- **Sugestão de Refatoração:**
  1.  Criar um novo arquivo: `src/components/portfolio/PortfolioCard.tsx`.
  2.  Mover todo o JSX e a lógica do componente `Card` para dentro de `PortfolioCard`, recebendo `trabalho`, `onDelete`, `onEdit` como props.
  3.  Na página `Portfolio.tsx`, substituir o bloco de código por:
      ```typescript
      <div className="grid ...">
        {trabalhosFiltrados.map((trabalho) => (
          <PortfolioCard 
            key={trabalho.id} 
            trabalho={trabalho}
            onEdit={() => navigate(`/portfolio/${trabalho.id}`)}
            onDelete={() => handleExcluirTrabalho(trabalho.id)}
            isExcluindo={isExcluindo}
          />
        ))}
      </div>
      ```
- **Benefícios:** Melhora a legibilidade, permite a reutilização do `PortfolioCard` em outros locais e facilita os testes do card de forma isolada.

### 3.3 UI de Exclusão Bloqueante (UX) - **Prioridade Média**

- **Localização:** `src/pages/Dashboard/Portfolio.tsx` (linha 114)
- **Problema:** `window.confirm()` é uma API do navegador que bloqueia a thread principal e tem um visual inconsistente entre navegadores.
- **Código Problemático:**
  ```typescript
  if (confirm('Tem certeza que deseja excluir este trabalho?')) {
    excluirTrabalho(trabalhoId);
  }
  ```
- **Sugestão de Refatoração:** Substituir o `confirm` por um componente de diálogo, como o `AlertDialog` da biblioteca `shadcn/ui`, que já está no projeto.
  ```typescript
  // Exemplo com AlertDialog
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" ...><Trash2/></Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação não pode ser desfeita. Isso excluirá permanentemente o trabalho do seu portfólio.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={() => excluirTrabalho(trabalho.id)}>
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  ```
- **Benefícios:** Experiência de usuário mais moderna, consistente e não-bloqueante.

### 3.4 Código Morto (Qualidade de Código) - **Prioridade Baixa**

- **Localização:** `src/pages/Dashboard/Portfolio.tsx` (linhas 33, 63-67)
- **Problema:** A lógica de `placeholders` foi desativada mas o código (`useState`, `useEffect`) ainda existe, poluindo o componente.
- **Sugestão de Refatoração:** Remover completamente o `useState` de `placeholders` e o `useEffect` que o manipula.

### 3.5 Estrutura de Hooks (DX) - **Prioridade Baixa**

- **Localização:** `src/hooks/usePortfolio.tsx` e `src/hooks/portfolio/index.ts`
- **Problema:** A estrutura de exportação dos hooks passa por múltiplos arquivos de "barril", dificultando rastrear a origem de um hook específico.
- **Sugestão de Refatoração:** Simplificar a estrutura. Em vez de ter `usePortfolio.tsx` reexportando de `portfolio/index.ts`, que por sua vez reexporta de outros arquivos, poderia haver um único `index.ts` em `src/hooks/portfolio/` que exporta todos os hooks relevantes diretamente. Isso tornaria a estrutura mais plana e fácil de navegar.
