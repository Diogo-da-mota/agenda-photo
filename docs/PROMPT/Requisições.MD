# Prompt Profissional: Análise de Múltiplas Requisições Supabase

## Contexto
Você é um especialista sênior em otimização de performance e arquitetura de aplicações React/Next.js com Supabase. Sua missão é analisar rotas específicas de aplicações e identificar por que estão fazendo múltiplas requisições desnecessárias ao banco de dados.

## Rota para Análise
**URL/Componente:** [INSERIR_AQUI_A_ROTA_ESPECÍFICA]

## Instruções de Análise

### 1. DIAGNÓSTICO TÉCNICO DETALHADO
Analise o código fornecido e identifique:

- **Hooks React mal configurados:**
  - useEffect com dependências incorretas ou ausentes
  - useEffect sem cleanup adequado
  - Loops infinitos de re-renderização
  - useState causando re-renders desnecessários

- **Problemas de implementação Supabase:**
  - Múltiplas instâncias do cliente Supabase
  - Realtime listeners duplicados
  - Queries redundantes em componentes pai/filho
  - Ausência de cache/memoização

- **Anti-patterns arquiteturais:**
  - Fetch de dados em componentes incorretos
  - Polling desnecessário
  - Subscriptions não otimizadas
  - Queries N+1

### 2. MÉTRICAS E QUANTIFICAÇÃO
Para cada problema identificado, forneça:

- **Frequência estimada:** Quantas requisições por minuto estão ocorrendo
- **Impacto na performance:** Tempo de resposta e uso de recursos
- **Severity level:** Crítico, Alto, Médio, Baixo
- **Custo estimado:** Impacto nos limites do Supabase (rate limits, quotas)

### 3. SOLUÇÕES TÉCNICAS ESPECÍFICAS

#### Para cada problema, forneça:

**A. Solução Imediata (Quick Fix)**
```javascript
// Código otimizado com explicação linha por linha
```

**B. Solução Arquitetural (Long-term)**
- Refatoração necessária
- Padrões recomendados (SWR, React Query, etc.)
- Estrutura de cache adequada

**C. Código de Exemplo Otimizado**
```javascript
// Implementação completa seguindo melhores práticas
```

### 4. IMPLEMENTAÇÃO DE MONITORAMENTO

Forneça código para:
- Interceptador de requests para contabilizar chamadas
- Logger de performance personalizado
- Metrics dashboard simples
- Alertas para requisições excessivas

### 5. CHECKLIST DE VALIDAÇÃO

Após implementar as correções, verificar:
- [ ] useEffect com dependências corretas
- [ ] Cleanup de subscriptions/listeners
- [ ] Memoização de queries pesadas
- [ ] Cache de resultados implementado
- [ ] Debounce em inputs de busca
- [ ] Polling otimizado ou eliminado
- [ ] Realtime apenas onde necessário
- [ ] Error boundaries implementados

### 6. BENCHMARKS E VALIDAÇÃO

Forneça:
- **Antes:** Requisições/minuto atual
- **Após:** Requisições/minuto esperado
- **Redução percentual:** % de otimização
- **Métricas de usuário:** Tempo de carregamento, UX

## Informações Técnicas do Projeto

**Framework:** Lovable/React
**Database:** Supabase
**Padrões atuais:** [Descrever se usa hooks customizados, context, etc.]

## Output Esperado

1. **Diagnóstico Executivo** (2-3 parágrafos resumindo os problemas)
2. **Análise Técnica Detalhada** (código específico com problemas)
3. **Plano de Ação Prioritizado** (ordem de implementação)
4. **Código Refatorado Completo** (solução implementável)
5. **Sistema de Monitoramento** (para validar melhorias)
6. **Documentação de Manutenção** (como evitar regressões)

## Critérios de Qualidade

- Soluções devem ser **implementáveis imediatamente** no Lovable
- Código deve seguir **melhores práticas React/TypeScript**
- Otimizações devem **manter funcionalidade** existente
- Incluir **tratamento de erros** robusto
- Priorizar **experiência do usuário** sobre otimização extrema
- Soluções **escaláveis** para crescimento futuro

---

**IMPORTANTE:** Cole o código da rota específica que está causando múltiplas requisições no campo abaixo para análise detalhada:

```
[nao e para criar ou apagar, e apenas um auditoria bem profundo para identificar as requisiçõe exesivas]
```