import { createClient } from '@supabase/supabase-js';

// Validação rigorosa de variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DEBUG: Log das variáveis de ambiente
console.log('[DEBUG] supabase.ts - Variáveis de ambiente:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0,
  environment: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV
});

// Função para validar credenciais de forma segura
const validateCredentials = () => {
  console.log('[DEBUG] supabase.ts - Validando credenciais:', {
    supabaseUrl: supabaseUrl || 'UNDEFINED',
    supabaseAnonKey: supabaseAnonKey ? 'DEFINIDA' : 'UNDEFINED'
  });
  
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error('ERRO CRÍTICO: Credenciais Supabase não configuradas');
    console.error('❌', error.message);
    console.log('[DEBUG] supabase.ts - Credenciais faltando:', {
      missingUrl: !supabaseUrl,
      missingKey: !supabaseAnonKey
    });
    
    if (import.meta.env.PROD) {
      // Em produção, mostrar interface de erro amigável
      throw error;
    } else {
      console.warn('⚠️ Executando em modo desenvolvimento sem credenciais');
      return false;
    }
  }
  console.log('[DEBUG] supabase.ts - Credenciais validadas com sucesso');
  return true;
};

// Validar credenciais antes de criar cliente
validateCredentials();

// SEGURANÇA: Usar apenas variáveis de ambiente - NUNCA hardcode credenciais
const finalUrl = supabaseUrl;
const finalKey = supabaseAnonKey;

console.log('[DEBUG] supabase.ts - Criando cliente Supabase:', {
  finalUrl: finalUrl || 'UNDEFINED',
  finalKey: finalKey ? 'DEFINIDA' : 'UNDEFINED'
});

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

console.log('[DEBUG] supabase.ts - Cliente Supabase criado:', {
  supabaseUrl: supabase.supabaseUrl,
  supabaseKey: supabase.supabaseKey ? 'DEFINIDA' : 'UNDEFINED'
});