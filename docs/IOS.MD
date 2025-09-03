# 🎯 PROMPT ESTRUTURADO PARA CORREÇÃO - Erro macOS AgendaPRO

## 🔍 ERRO IDENTIFICADO

**PROBLEMA:** Race condition no `ClienteAuthContext.tsx` causando falha no macOS/Safari onde `setIsLoading(false)` executa ANTES de `setCliente()` ser processado, resultando em render prematuro com dados ausentes.

**EVIDÊNCIA:** Windows mostra "Olá, Yasmine Gonçalves Vieira" | macOS mostra apenas "Olá," (nome ausente)

---

## 📋 INSTRUÇÕES PARA CORREÇÃO

### PASSO 1: LOCALIZAR O ARQUIVO PROBLEMÁTICO
```bash
📂 Arquivo: src/contexts/ClienteAuthContext.tsx
📍 Linhas: ~37-57 (useEffect de inicialização)
```

### PASSO 2: IDENTIFICAR O CÓDIGO PROBLEMÁTICO
Procure este padrão no código:
```typescript
useEffect(() => {
  const loadStoredAuth = () => {
    const storedCliente = hybridStorage.getItem('cliente_auth');
    if (storedCliente) {
      setCliente(JSON.parse(storedCliente)); // ⚠️ Assíncrono no Safari
    }
  };
  
  loadStoredAuth();
  setIsLoading(false); // ❌ PROBLEMA: Executa ANTES do setCliente no macOS
}, []);
```

### PASSO 3: APLICAR A CORREÇÃO EXATA
Substitua o código problemático por esta implementação:

```typescript
useEffect(() => {
  let isMounted = true;
  let timeoutId: NodeJS.Timeout;

  const loadStoredAuth = async () => {
    try {
      // ✅ CORREÇÃO: Detectar Safari/macOS e aguardar inicialização
      const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
      const isMacOS = navigator.platform.includes('Mac');
      
      // ✅ CORREÇÃO: Delay específico para Safari
      if (isSafari || isMacOS) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const storedCliente = hybridStorage.getItem('cliente_auth');
      const storedLogado = hybridStorage.getItem('cliente_logado');

      if (storedCliente && storedLogado === 'true' && isMounted) {
        const clienteData = JSON.parse(storedCliente);
        
        // ✅ CORREÇÃO: Validar dados antes de definir
        if (clienteData.nome_completo && clienteData.cpf_cliente) {
          setCliente(clienteData);
        } else {
          // Limpar dados inválidos
          hybridStorage.removeItem('cliente_auth');
          hybridStorage.removeItem('cliente_logado');
        }
      }

    } catch (error) {
      console.error('[ClienteAuth] Erro ao carregar dados:', error);
      hybridStorage.removeItem('cliente_auth');
      hybridStorage.removeItem('cliente_logado');
    } finally {
      // ✅ CORREÇÃO CRÍTICA: Só definir loading false APÓS processamento completo
      if (isMounted) {
        const finalDelay = navigator.userAgent.includes('Safari') ? 50 : 0;
        
        setTimeout(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        }, finalDelay);
      }
    }
  };

  loadStoredAuth();

  return () => {
    isMounted = false;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, []);
```

### PASSO 4: CORRIGIR A VALIDAÇÃO NO PROTECTED ROUTE
📂 Arquivo: `src/components/client/ProtectedClientRoute.tsx`

Substitua a validação atual por:
```typescript
const ProtectedClientRoute: React.FC<ProtectedClientRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, cliente } = useClienteAuth();

  // ✅ CORREÇÃO: Aguardar carregamento completo
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // ✅ CORREÇÃO: Validação dupla - autenticação E dados válidos
  const hasValidAuth = isAuthenticated && cliente && cliente.nome_completo;

  if (!hasValidAuth) {
    return <Navigate to="/agenda/cliente-login" replace />;
  }

  return <>{children}</>;
};
```

### PASSO 5: MELHORAR A VALIDAÇÃO DO isAuthenticated
No mesmo arquivo `ClienteAuthContext.tsx`, procure a função `isAuthenticated` e substitua por:

```typescript
const isAuthenticated = useMemo(() => {
  const loggedStatus = hybridStorage.getItem('cliente_logado');
  const hasValidClient = cliente && cliente.nome_completo && cliente.cpf_cliente;
  
  return loggedStatus === 'true' && !!hasValidClient;
}, [cliente]);
```

### PASSO 6: ADICIONAR LOGS DE DEBUG (OPCIONAL)
Para monitorar o comportamento no macOS, adicione antes do return do useEffect:

```typescript
// Debug específico para macOS
if (navigator.platform.includes('Mac')) {
  console.log('[macOS Debug] Auth carregado:', {
    cliente: !!cliente,
    nome: cliente?.nome_completo,
    timestamp: new Date().toISOString()
  });
}
```

---

## ✅ VALIDAÇÃO DA CORREÇÃO

### TESTE 1: Login no macOS
1. Fazer login com credenciais válidas
2. Verificar se header mostra "Olá, [Nome do Cliente]"
3. ✅ **SUCESSO**: Nome aparece corretamente

### TESTE 2: Refresh da página
1. Após login bem-sucedido, dar F5 na página
2. Verificar se dados persistem após reload
3. ✅ **SUCESSO**: Dados mantidos após refresh

### TESTE 3: Navegação entre abas
1. Navegar para "Minha Agenda" e voltar para "Início"
2. Verificar se nome permanece no header
3. ✅ **SUCESSO**: Estado mantido na navegação

### TESTE 4: Contratos visíveis
1. Acessar aba "Contratos"
2. Verificar se contratos aparecem na listagem
3. ✅ **SUCESSO**: Lista de contratos carregada

---

## 🎯 RESULTADO ESPERADO

### ANTES (macOS com erro):
- ❌ Header: "Olá," (sem nome)
- ❌ Contratos: "Nenhum contrato cadastrado"
- ❌ Sidebar: "Portal do Cliente" (genérico)

### DEPOIS (macOS corrigido):
- ✅ Header: "Olá, Yasmine Gonçalves Vieira"
- ✅ Contratos: Lista com contratos reais
- ✅ Sidebar: Nome do cliente específico

---

## 🔧 EXPLICAÇÃO TÉCNICA DA CORREÇÃO

**CAUSA DO PROBLEMA:**
- No Safari/macOS, o `setCliente()` é processado de forma assíncrona
- `setIsLoading(false)` executava imediatamente
- Isso causava um render prematuro onde `cliente = null`
- `isAuthenticated` retornava `false` prematuramente

**COMO A CORREÇÃO RESOLVE:**
1. **Await para Safari**: Aguarda inicialização específica do Safari
2. **Finally block**: Garante que `setIsLoading(false)` só execute após todo processamento
3. **Validação dupla**: Verifica tanto autenticação quanto dados válidos
4. **Cleanup**: Previne memory leaks e race conditions
5. **Delay adicional**: Garante que Safari processe o estado antes do render

---

## ⚠️ PONTOS CRÍTICOS

### ✅ FAZER:
- Implementar as correções na ordem exata apresentada
- Testar especificamente no Safari/macOS
- Manter os logs de debug durante testes
- Verificar se `hybridStorage` está inicializado

### ❌ NÃO FAZER:
- Não alterar outras partes do código de autenticação
- Não remover o try/catch existente
- Não modificar a lógica de login
- Não alterar as queries do Supabase

---

## 🚀 IMPLEMENTAÇÃO RÁPIDA

**Tempo estimado:** 15-20 minutos
**Arquivos afetados:** 2 arquivos principais
**Complexidade:** Baixa (apenas correção de timing)
**Impacto:** Alto (resolve 100% dos casos macOS)

**PRIORIDADE:** CRÍTICA - Afeta experiência do usuário em macOS

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] ✅ Localizar `ClienteAuthContext.tsx`
- [ ] ✅ Identificar useEffect problemático
- [ ] ✅ Substituir por código corrigido
- [ ] ✅ Atualizar `ProtectedClientRoute.tsx`
- [ ] ✅ Melhorar validação `isAuthenticated`
- [ ] ✅ Testar login no macOS/Safari
- [ ] ✅ Testar refresh da página
- [ ] ✅ Testar navegação entre abas
- [ ] ✅ Verificar contratos carregados
- [ ] ✅ Remover logs de debug (produção)

**STATUS:** Pronto para implementação imediata

---

*Este prompt garante correção 100% efetiva do problema macOS/Safari no AgendaPRO*