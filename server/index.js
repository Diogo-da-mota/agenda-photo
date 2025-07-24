// Servidor Express para lidar com autenticação segura
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Verificar variáveis de ambiente
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias');
  process.exit(1);
}

// Cliente Supabase com chave de serviço (segura para uso no servidor)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configuração CORS restrita para segurança
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:8080').split(',');
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido por CORS'));
    }
  },
  credentials: true, // importante para cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400 // 24 horas em segundos
};

// Configurar limite de taxa para prevenir ataques de força bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limitar cada IP a 100 requisições por janela
  standardHeaders: true, // Retornar rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilitar headers `X-RateLimit-*`
  message: {
    error: 'Muitas requisições, tente novamente mais tarde'
  }
});

// Aplicar rate limiting a todas as requisições
app.use(limiter);

// Aplicar limite mais restrito para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Limite de 10 tentativas por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de login, tente novamente mais tarde'
  }
});

// Configurar headers de segurança com Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-'", "'sha256-'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'nonce-'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL, "https://api.example.com"], // Ajustar conforme suas APIs
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({
  limit: '10kb', // Limitar tamanho do payload
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Salvar corpo bruto para validação CSRF
  }
}));
app.use(cookieParser());

// Middleware de validação para entrada de dados
const validateInput = (req, res, next) => {
  const contentType = req.headers['content-type'];
  
  // Verificar content-type adequado
  if (req.method !== 'GET' && (!contentType || !contentType.includes('application/json'))) {
    return res.status(415).json({ error: 'Formato de conteúdo não suportado' });
  }
  
  // Validar tamanho do corpo da requisição
  if (req.method !== 'GET' && req.headers['content-length'] > 10240) { // 10KB
    return res.status(413).json({ error: 'Payload muito grande' });
  }
  
  next();
};

app.use(validateInput);

// Configurar proteção CSRF
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  }
});

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware para configurar o X-Content-Type-Options
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Configurações de cookies seguras
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Usar HTTPS em produção
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: '/'
};

// Middleware para verificar autenticação
const requireAuth = async (req, res, next) => {
  const { session_token, refresh_token } = req.cookies;
  
  if (!session_token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  try {
    // Verificar se o token é válido
    const { data, error } = await supabase.auth.getUser(session_token);
    
    if (error || !data.user) {
      // Tentar refresh token se disponível
      if (refresh_token) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token
        });
        
        if (refreshError || !refreshData.session) {
          // Limpar cookies se refresh falhar
          res.clearCookie('session_token');
          res.clearCookie('refresh_token');
          return res.status(401).json({ error: 'Sessão expirada' });
        }
        
        // Atualizar cookies com novos tokens
        res.cookie('session_token', refreshData.session.access_token, cookieOptions);
        res.cookie('refresh_token', refreshData.session.refresh_token, cookieOptions);
        req.user = refreshData.user;
        return next();
      }
      
      // Sem refresh token ou refresh falhou
      res.clearCookie('session_token');
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    // Token válido
    req.user = data.user;
    next();
  } catch (err) {
    console.error('Erro ao verificar autenticação:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Aplicar proteção CSRF a rotas que precisam de autenticação
app.use(['/auth/logout', '/api/*'], csrfProtection);

// Rota para obter um token CSRF
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Rotas de autenticação
// Login
app.post('/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Validar formato de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }
  
  // Validar requisitos mínimos de senha
  if (password.length < 8) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Mensagem genérica para dificultar a enumeração
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
    
    // Verificar se o usuário tem 2FA ativado
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_security_settings')
      .select('totp_enabled')
      .eq('user_id', data.user.id)
      .single();
    
    if (!settingsError && userSettings?.totp_enabled) {
      // Usuário tem 2FA ativado, retornar informação para solicitar token
      return res.json({
        requires2FA: true,
        user: {
          id: data.user.id,
          email: data.user.email
        },
        // Token temporário para validação 2FA
        tempToken: data.session.access_token
      });
    }
    
    // Usuário não tem 2FA, proceder com login normal
    // Definir cookies seguros
    res.cookie('session_token', data.session.access_token, cookieOptions);
    res.cookie('refresh_token', data.session.refresh_token, cookieOptions);
    
    // Gerar um CSRF token
    const csrfToken = uuidv4();
    res.cookie('csrf_token', csrfToken, {
      ...cookieOptions,
      httpOnly: false // CSRF token precisa ser acessível ao JavaScript
    });
    
    // Retornar dados do usuário (sem tokens sensíveis)
    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at,
        user_metadata: data.user.user_metadata
      },
      csrf_token: csrfToken
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
app.post('/auth/logout', requireAuth, async (req, res) => {
  try {
    // Invalidar sessão no Supabase
    await supabase.auth.signOut();
    
    // Limpar cookies
    res.clearCookie('session_token');
    res.clearCookie('refresh_token');
    res.clearCookie('csrf_token');
    
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (err) {
    console.error('Erro no logout:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registro
app.post('/auth/register', authLimiter, async (req, res) => {
  const { email, password, metadata } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Validar formato de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }
  
  // Validar política de senha forte
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      error: 'A senha não atende aos requisitos de segurança.',
      details: 'A senha deve ter no mínimo 12 caracteres, incluindo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).'
    });
  }
  
  // Validar metadata, se fornecida
  if (metadata) {
    if (typeof metadata !== 'object') {
      return res.status(400).json({ error: 'Metadata deve ser um objeto' });
    }
    
    // Verificar tamanho dos metadados
    if (JSON.stringify(metadata).length > 5000) {
      return res.status(400).json({ error: 'Metadata muito grande' });
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    });
    
    if (error) {
       // Mensagem genérica para dificultar a enumeração
      return res.status(400).json({ error: 'Não foi possível registrar o usuário. Verifique os dados ou tente novamente.' });
    }
    
    // Se confirmação de email estiver ativada
    if (!data.session) {
      return res.json({ 
        success: true, 
        message: 'Verifique seu email para confirmar o registro' 
      });
    }
    
    // Se não precisar de confirmação, definir cookies
    res.cookie('session_token', data.session.access_token, cookieOptions);
    res.cookie('refresh_token', data.session.refresh_token, cookieOptions);
    
    // Gerar um CSRF token
    const csrfToken = uuidv4();
    res.cookie('csrf_token', csrfToken, {
      ...cookieOptions,
      httpOnly: false
    });
    
    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        user_metadata: data.user.user_metadata
      },
      csrf_token: csrfToken
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar sessão atual
app.get('/auth/session', async (req, res) => {
  const { session_token, refresh_token } = req.cookies;
  
  if (!session_token) {
    return res.json({ authenticated: false });
  }
  
  try {
    // Verificar token de acesso
    const { data, error } = await supabase.auth.getUser(session_token);
    
    if (error || !data.user) {
      // Tentar refresh token se disponível
      if (refresh_token) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token
        });
        
        if (refreshError || !refreshData.session) {
          // Limpar cookies se refresh falhar
          res.clearCookie('session_token');
          res.clearCookie('refresh_token');
          return res.json({ authenticated: false });
        }
        
        // Atualizar cookies com novos tokens
        res.cookie('session_token', refreshData.session.access_token, cookieOptions);
        res.cookie('refresh_token', refreshData.session.refresh_token, cookieOptions);
        
        return res.json({
          authenticated: true,
          user: {
            id: refreshData.user.id,
            email: refreshData.user.email,
            created_at: refreshData.user.created_at,
            last_sign_in_at: refreshData.user.last_sign_in_at,
            user_metadata: refreshData.user.user_metadata
          }
        });
      }
      
      // Sem refresh token ou refresh falhou
      res.clearCookie('session_token');
      return res.json({ authenticated: false });
    }
    
    // Token válido
    return res.json({
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at,
        user_metadata: data.user.user_metadata
      }
    });
  } catch (err) {
    console.error('Erro ao verificar sessão:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para resetar senha
app.post('/auth/reset-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  // Validar formato de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL || 'http://localhost:8080'}/reset-password`
    });
    
    // NÃO verificar o 'error' aqui. Sempre retorne a mesma mensagem.
    res.json({ success: true, message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' });
  } catch (err) {
    console.error('Erro ao solicitar reset de senha:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para OAuth (Google)
app.post('/auth/oauth', limiter, async (req, res) => {
  const { provider, redirectTo, state } = req.body;
  
  if (!provider) {
    return res.status(400).json({ error: 'Provider é obrigatório' });
  }
  
  // Validar o provider (apenas provedores suportados)
  const allowedProviders = ['google', 'facebook', 'github', 'twitter', 'apple'];
  if (!allowedProviders.includes(provider)) {
    return res.status(400).json({ error: 'Provider não suportado' });
  }
  
  // Validar URL de redirecionamento, se fornecida
  if (redirectTo) {
    try {
      const url = new URL(redirectTo);
      const allowedDomains = [
        new URL(process.env.CLIENT_URL || 'http://localhost:8080').hostname
      ];
      
      if (!allowedDomains.includes(url.hostname)) {
        return res.status(400).json({ error: 'URL de redirecionamento não permitida' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'URL de redirecionamento inválida' });
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || process.env.CLIENT_URL || 'http://localhost:8080',
        state: state // Adicionar o parâmetro state para proteção CSRF
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ url: data.url });
  } catch (err) {
    console.error('Erro ao iniciar OAuth:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para callback do OAuth
app.get('/auth/callback', limiter, async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/login?error=callback_error`);
  }
  
  // Validar o código para garantir que não contém caracteres potencialmente perigosos
  if (typeof code !== 'string' || code.length > 2000 || /[<>]/.test(code)) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/login?error=invalid_code`);
  }
  
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error || !data.session) {
      // Redireciona para uma página de erro genérica
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/login?error=oauth_failed`);
    }
    
    // Definir cookies seguros
    res.cookie('session_token', data.session.access_token, cookieOptions);
    res.cookie('refresh_token', data.session.refresh_token, cookieOptions);
    
    // Gerar um CSRF token
    const csrfToken = uuidv4();
    res.cookie('csrf_token', csrfToken, {
      ...cookieOptions,
      httpOnly: false
    });
    
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/dashboard`);
  } catch (err) {
    console.error('Erro no callback OAuth:', err);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/login?error=server_error`);
  }
});

// Rotas para autenticação de dois fatores (2FA)

// Gerar segredo TOTP para um usuário
app.post('/auth/2fa/setup', requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Verificar se o usuário já tem 2FA configurado
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 = Not found
      return res.status(500).json({ error: 'Erro ao verificar configurações de segurança' });
    }
    
    // Se o usuário já tem 2FA ativo
    if (userSettings?.totp_enabled) {
      return res.status(400).json({ error: 'Autenticação de dois fatores já está ativada' });
    }
    
    // Gerar um novo segredo
    const secret = authenticator.generateSecret();
    
    // Gerar QR Code
    const appName = 'Agenda Pro';
    const otpauth = authenticator.keyuri(req.user.email, appName, secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    
    // Salvar o segredo temporariamente (ou permanentemente se a tabela existir)
    const { error: saveError } = await supabase
      .from('user_security_settings')
      .upsert({
        user_id: userId,
        totp_secret: secret,
        totp_enabled: false,
        totp_verified: false,
        totp_created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (saveError) {
      console.error('Erro ao salvar segredo TOTP:', saveError);
      return res.status(500).json({ error: 'Erro ao configurar 2FA' });
    }
    
    // Retornar informações para o cliente
    res.json({
      secret,
      qrCode,
      otpauth
    });
  } catch (err) {
    console.error('Erro ao configurar 2FA:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar e ativar 2FA
app.post('/auth/2fa/verify', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório' });
  }
  
  try {
    // Buscar o segredo do usuário
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (settingsError || !userSettings?.totp_secret) {
      return res.status(400).json({ error: 'Configuração 2FA não encontrada' });
    }
    
    // Verificar o token
    const isValid = authenticator.verify({
      token,
      secret: userSettings.totp_secret
    });
    
    if (!isValid) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    
    // Gerar códigos de recuperação
    const recoveryCodes = [];
    for (let i = 0; i < 10; i++) {
      recoveryCodes.push(uuidv4().replace(/-/g, '').substring(0, 10));
    }
    
    // Ativar 2FA e salvar códigos de recuperação
    const { error: updateError } = await supabase
      .from('user_security_settings')
      .update({
        totp_enabled: true,
        totp_verified: true,
        totp_verified_at: new Date().toISOString(),
        recovery_codes: recoveryCodes
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Erro ao ativar 2FA:', updateError);
      return res.status(500).json({ error: 'Erro ao ativar 2FA' });
    }
    
    // Retornar códigos de recuperação para o cliente
    res.json({
      success: true,
      message: 'Autenticação de dois fatores ativada com sucesso',
      recoveryCodes
    });
  } catch (err) {
    console.error('Erro ao verificar token 2FA:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token 2FA durante login
app.post('/auth/2fa/validate', async (req, res) => {
  // Remover a variável 'email' do body
  const { token, sessionToken } = req.body;

  // Remover a condição de email, forçar o uso do sessionToken
  if (!sessionToken || !token) {
    return res.status(400).json({ error: 'Token de sessão e token 2FA são obrigatórios' });
  }
  
  try {
    let userId;
    
    // Obter o usuário pelo token de sessão
    const { data: userData, error: userError } = await supabase.auth.getUser(sessionToken);
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }
    userId = userData.user.id;
    
    // Buscar as configurações de segurança
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (settingsError || !userSettings) {
      return res.status(400).json({ error: 'Configuração 2FA não encontrada' });
    }
    
    // Verificar se é um código de recuperação
    if (userSettings.recovery_codes && userSettings.recovery_codes.includes(token)) {
      // Remover o código de recuperação usado
      const updatedCodes = userSettings.recovery_codes.filter(code => code !== token);
      
      await supabase
        .from('user_security_settings')
        .update({ recovery_codes: updatedCodes })
        .eq('user_id', userId);
      
      return res.json({ success: true, message: 'Código de recuperação válido', isRecoveryCode: true });
    }
    
    // Verificar o token TOTP
    const isValid = authenticator.verify({
      token,
      secret: userSettings.totp_secret
    });
    
    if (!isValid) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    
    res.json({ success: true, message: 'Token válido' });
  } catch (err) {
    console.error('Erro ao validar token 2FA:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Desativar 2FA
app.post('/auth/2fa/disable', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;
  
  try {
    // Buscar o segredo do usuário
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (settingsError || !userSettings?.totp_secret) {
      return res.status(400).json({ error: 'Configuração 2FA não encontrada' });
    }
    
    // Verificar o token
    const isValid = authenticator.verify({
      token,
      secret: userSettings.totp_secret
    });
    
    // Verificar se é um código de recuperação
    const isRecoveryCode = userSettings.recovery_codes && userSettings.recovery_codes.includes(token);
    
    if (!isValid && !isRecoveryCode) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    
    // Desativar 2FA
    const { error: updateError } = await supabase
      .from('user_security_settings')
      .update({
        totp_enabled: false,
        totp_verified: false,
        recovery_codes: null
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Erro ao desativar 2FA:', updateError);
      return res.status(500).json({ error: 'Erro ao desativar 2FA' });
    }
    
    res.json({
      success: true,
      message: 'Autenticação de dois fatores desativada com sucesso'
    });
  } catch (err) {
    console.error('Erro ao desativar 2FA:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar status 2FA
app.get('/auth/2fa/status', requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Buscar as configurações de segurança
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 = Not found
      console.error('Erro ao verificar status 2FA:', settingsError);
      return res.status(500).json({ error: 'Erro ao verificar status 2FA' });
    }
    
    const status = {
      enabled: userSettings?.totp_enabled || false,
      verified: userSettings?.totp_verified || false,
      createdAt: userSettings?.totp_created_at || null,
      verifiedAt: userSettings?.totp_verified_at || null,
      hasRecoveryCodes: userSettings?.recovery_codes ? userSettings.recovery_codes.length > 0 : false
    };
    
    res.json(status);
  } catch (err) {
    console.error('Erro ao verificar status 2FA:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para completar login após validação 2FA
app.post('/auth/2fa/complete-login', async (req, res) => {
  const { tempToken } = req.body;
  
  if (!tempToken) {
    return res.status(400).json({ error: 'Token temporário é obrigatório' });
  }
  
  try {
    // Verificar o token temporário
    const { data: userData, error: userError } = await supabase.auth.getUser(tempToken);
    
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    // Gerar uma nova sessão
    const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession({
      refresh_token: tempToken
    });
    
    if (sessionError || !sessionData.session) {
      return res.status(500).json({ error: 'Erro ao gerar nova sessão' });
    }
    
    // Definir cookies seguros
    res.cookie('session_token', sessionData.session.access_token, cookieOptions);
    res.cookie('refresh_token', sessionData.session.refresh_token, cookieOptions);
    
    // Gerar um CSRF token
    const csrfToken = uuidv4();
    res.cookie('csrf_token', csrfToken, {
      ...cookieOptions,
      httpOnly: false // CSRF token precisa ser acessível ao JavaScript
    });
    
    // Registrar login bem-sucedido com 2FA
    await supabase.from('user_login_logs').insert({
      user_id: userData.user.id,
      login_type: '2fa',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      success: true
    });
    
    // Retornar dados do usuário (sem tokens sensíveis)
    res.json({
      user: {
        id: userData.user.id,
        email: userData.user.email,
        created_at: userData.user.created_at,
        last_sign_in_at: userData.user.last_sign_in_at,
        user_metadata: userData.user.user_metadata
      },
      csrf_token: csrfToken
    });
  } catch (err) {
    console.error('Erro ao completar login 2FA:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para gerenciamento de sessões
app.get('/auth/sessions', requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Buscar sessões ativas do usuário
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('revoked', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar sessões:', error);
      return res.status(500).json({ error: 'Erro ao buscar sessões' });
    }
    
    // Enriquecer com dados de geolocalização e device info
    const enhancedSessions = sessions.map(session => {
      const device = session.user_agent ? detectDevice(session.user_agent) : 'Dispositivo desconhecido';
      return {
        ...session,
        device
      };
    });
    
    res.json({ sessions: enhancedSessions });
  } catch (err) {
    console.error('Erro ao listar sessões:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Revogar uma sessão específica
app.post('/auth/sessions/revoke', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'ID da sessão é obrigatório' });
  }
  
  try {
    // Verificar se a sessão pertence ao usuário
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
    
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }
    
    // Revogar a sessão
    const { error } = await supabase
      .from('user_sessions')
      .update({ 
        revoked: true,
        revoked_at: new Date().toISOString()
      })
      .eq('id', sessionId);
    
    if (error) {
      console.error('Erro ao revogar sessão:', error);
      return res.status(500).json({ error: 'Erro ao revogar sessão' });
    }
    
    // Registrar evento de segurança
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'session_revoked',
      p_ip_address: req.ip,
      p_user_agent: req.headers['user-agent'],
      p_old_value: session.id
    });
    
    res.json({ success: true, message: 'Sessão revogada com sucesso' });
  } catch (err) {
    console.error('Erro ao revogar sessão:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Revogar todas as sessões exceto a atual
app.post('/auth/sessions/revoke-all', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const currentToken = req.cookies.session_token || req.headers.authorization?.split(' ')[1];
  
  if (!currentToken) {
    return res.status(401).json({ error: 'Token de sessão não encontrado' });
  }
  
  try {
    // Buscar o ID da sessão atual
    const { data: currentSession, error: currentSessionError } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('session_token', currentToken)
      .single();
    
    if (currentSessionError) {
      console.error('Erro ao buscar sessão atual:', currentSessionError);
    }
    
    // Revogar todas as sessões exceto a atual
    const { error } = await supabase
      .from('user_sessions')
      .update({ 
        revoked: true,
        revoked_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .neq('id', currentSession?.id || '0');
    
    if (error) {
      console.error('Erro ao revogar todas as sessões:', error);
      return res.status(500).json({ error: 'Erro ao revogar sessões' });
    }
    
    // Registrar evento de segurança
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'all_sessions_revoked',
      p_ip_address: req.ip,
      p_user_agent: req.headers['user-agent']
    });
    
    res.json({ success: true, message: 'Todas as sessões foram revogadas com sucesso' });
  } catch (err) {
    console.error('Erro ao revogar todas as sessões:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar alertas de segurança
app.get('/auth/security-alerts', requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Buscar alertas de segurança do usuário
    const { data: alerts, error } = await supabase
      .from('security_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Erro ao buscar alertas de segurança:', error);
      return res.status(500).json({ error: 'Erro ao buscar alertas de segurança' });
    }
    
    res.json({ alerts });
  } catch (err) {
    console.error('Erro ao listar alertas de segurança:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Marcar alerta de segurança como resolvido
app.post('/auth/security-alerts/resolve', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { alertId } = req.body;
  
  if (!alertId) {
    return res.status(400).json({ error: 'ID do alerta é obrigatório' });
  }
  
  try {
    // Verificar se o alerta pertence ao usuário
    const { data: alert, error: alertError } = await supabase
      .from('security_alerts')
      .select('*')
      .eq('id', alertId)
      .eq('user_id', userId)
      .single();
    
    if (alertError || !alert) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }
    
    if (alert.resolved) {
      return res.status(400).json({ error: 'Alerta já está resolvido' });
    }
    
    // Marcar como resolvido
    const { error } = await supabase
      .from('security_alerts')
      .update({ 
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: userId
      })
      .eq('id', alertId);
    
    if (error) {
      console.error('Erro ao resolver alerta:', error);
      return res.status(500).json({ error: 'Erro ao resolver alerta' });
    }
    
    res.json({ success: true, message: 'Alerta resolvido com sucesso' });
  } catch (err) {
    console.error('Erro ao resolver alerta:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para detectar informações do dispositivo a partir do user-agent
function detectDevice(userAgent) {
  if (!userAgent) return 'Dispositivo desconhecido';
  
  userAgent = userAgent.toLowerCase();
  
  // Detectar sistema operacional
  let os = 'Desconhecido';
  if (userAgent.includes('windows')) {
    os = 'Windows';
  } else if (userAgent.includes('mac')) {
    os = 'MacOS';
  } else if (userAgent.includes('android')) {
    os = 'Android';
  } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    os = 'iOS';
  } else if (userAgent.includes('linux')) {
    os = 'Linux';
  }
  
  // Detectar navegador
  let browser = 'Desconhecido';
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('opera') || userAgent.includes('opr')) {
    browser = 'Opera';
  }
  
  return `${browser} em ${os}`;
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de autenticação rodando na porta ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS permitido para: ${corsOptions.origin}`);
}); 