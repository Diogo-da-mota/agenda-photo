# Servidor de Autenticação Segura - Agenda Pro

Este servidor implementa uma camada de segurança adicional para a aplicação Agenda Pro, migrando os tokens JWT para cookies HttpOnly e adicionando proteção contra ataques CSRF.

## Características de Segurança

- Tokens JWT armazenados como cookies HttpOnly (não acessíveis via JavaScript)
- Proteção CSRF com tokens de verificação
- Verificação segura de sessões
- Refresh automático de tokens
- Configurações de cookies seguros (Secure, SameSite)
- Validação de entrada e sanitização
- Políticas CORS restritas

## Requisitos

- Node.js 16+ 
- Supabase (com chave de serviço)

## Configuração

1. Instale as dependências:
```bash
cd server
npm install
```

2. Crie um arquivo `.env` baseado no `env.example`:
```bash
cp env.example .env
```

3. Configure as variáveis de ambiente no arquivo `.env`:
```
# Supabase
SUPABASE_URL=https://sua-url.supabase.co
SUPABASE_SERVICE_KEY=sua-chave-de-servico-supabase

# Servidor
SERVER_PORT=3000
NODE_ENV=development

# Cliente
CLIENT_URL=http://localhost:8080
```

## Execução

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Integração com o Cliente

O cliente React precisa ser configurado para usar os endpoints de autenticação do servidor. Certifique-se de que:

1. A variável `VITE_AUTH_API_URL` está configurada no arquivo `.env` do cliente.
2. O hook `useAuth` foi atualizado para utilizar cookies em vez de localStorage.
3. As requisições HTTP para o servidor incluem a opção `withCredentials: true`.
4. Os tokens CSRF são incluídos nas requisições que alteram dados.

## Rotas de API

- `POST /auth/login` - Login com email e senha
- `POST /auth/register` - Cadastro de novos usuários
- `POST /auth/logout` - Logout (invalidação de sessão)
- `GET /auth/session` - Verificação do estado da sessão atual
- `POST /auth/reset-password` - Solicitação de recuperação de senha
- `POST /auth/oauth` - Início de autenticação OAuth (Google)
- `GET /auth/callback` - Callback para autenticação OAuth

## Segurança do Supabase

Para complementar esta implementação, certifique-se de:

1. Ativar o RLS (Row Level Security) em todas as tabelas.
2. Implementar as políticas RLS conforme documentado em `server/sql/rls_policies.sql`.
3. Evitar o uso da chave anon em operações sensíveis no cliente.
4. Utilizar as funções de sanitização implementadas em `src/utils/securityUtils.ts` para todas as entradas de usuário.

## Ambiente de Produção

Para produção, recomenda-se:

1. Usar HTTPS (definir `NODE_ENV=production` ativa cookies Secure)
2. Configurar um proxy reverso (Nginx/Apache) com headers de segurança adicionais
3. Implementar rate limiting para prevenir ataques de força bruta
4. Monitorar logs de tentativas de acesso suspeitas 