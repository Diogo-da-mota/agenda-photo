import { createClient } from '@supabase/supabase-js';

// Função para validar e obter as credenciais do Supabase
function getSupabaseCredentials() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Log apenas em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('🔍 Verificando credenciais Supabase...');
    console.log('URL presente:', !!supabaseUrl);
    console.log('Key presente:', !!supabaseAnonKey);
  }

  // Validação das credenciais
  if (!supabaseUrl) {
    const error = 'VITE_SUPABASE_URL não definida no arquivo .env';
    console.error('❌ ERRO CRÍTICO:', error);
    throw new Error(error);
  }

  if (!supabaseAnonKey) {
    const error = 'VITE_SUPABASE_ANON_KEY não definida no arquivo .env';
    console.error('❌ ERRO CRÍTICO:', error);
    throw new Error(error);
  }

  // Validação do formato da URL
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    const error = 'VITE_SUPABASE_URL deve ser uma URL válida do Supabase (https://...supabase.co)';
    console.error('❌ ERRO:', error);
    throw new Error(error);
  }

  // Validação básica da chave
  if (supabaseAnonKey.length < 100) {
    const error = 'VITE_SUPABASE_ANON_KEY parece inválida (muito curta)';
    console.error('❌ ERRO:', error);
    throw new Error(error);
  }

  if (import.meta.env.DEV) {
    console.log('✅ Credenciais Supabase validadas com sucesso');
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Obter e validar credenciais
const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log de sucesso apenas em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🚀 Cliente Supabase inicializado com sucesso');
}