
# Requisitos de Contexto do Router para o AuthProvider

## Estrutura Correta

O `AuthProvider` deve SEMPRE estar dentro de um componente `BrowserRouter` ou outro contexto de roteamento do React Router. 
A estrutura correta é:

```jsx
<BrowserRouter>
  <AuthProvider>
    {/* componentes filhos */}
  </AuthProvider>
</BrowserRouter>
```

## Explicação Técnica

O erro "useNavigate() may be used only in the context of a <Router> component" ocorre quando o hook `useNavigate()` 
é chamado fora do contexto de um Router.

O componente `AuthProvider` usa internamente o hook `useNavigate()` para redirecionamentos após login, logout e 
outras operações de autenticação. Por isso, ele precisa estar envolvido por um `BrowserRouter`.

## Proteção Implementada

A implementação atual do `AuthProvider` inclui um mecanismo de segurança:

1. Tenta usar `useNavigate()` e `useLocation()` dentro de um bloco try/catch
2. Se não estiver dentro de um contexto de Router, continua funcionando com funcionalidades limitadas
3. Registra um aviso no console para ajudar a diagnosticar o problema

No entanto, é sempre melhor seguir a estrutura correta para garantir todas as funcionalidades.

## O que Fazer se Vir esse Erro

Se você vir o erro "useNavigate() may be used only in the context of a <Router> component", verifique:

1. Se o `AuthProvider` está dentro de um `BrowserRouter` na hierarquia de componentes
2. Se você não está importando `AuthProvider` dentro de um componente que é usado fora de um Router
3. Se você não está renderizando o `AuthProvider` condicionalmente de forma que ele seja montado antes do Router

## Modificação das Rotas

As rotas agora são definidas em um componente separado `AppRoutes.tsx` para melhorar a organização e evitar 
problemas relacionados à ordem de inicialização dos componentes.
