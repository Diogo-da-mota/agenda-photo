import { createClient } from '@supabase/supabase-js';

// Validação rigorosa de variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Função para validar credenciais de forma segura
const validateCredentials = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error('ERRO CRÍTICO: Credenciais Supabase não configuradas');
    console.error('❌', error.message);
    
    if (import.meta.env.PROD) {
      // Em produção, mostrar interface de erro amigável
      throw error;
    } else {
      console.warn('⚠️ Executando em modo desenvolvimento sem credenciais');
      return false;
    }
  }
  return true;
};

// Validar credenciais antes de criar cliente
validateCredentials();

// SEGURANÇA: Usar apenas variáveis de ambiente - NUNCA hardcode credenciais
const finalUrl = supabaseUrl;
const finalKey = supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});