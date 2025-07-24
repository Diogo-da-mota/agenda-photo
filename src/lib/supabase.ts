import { createClient } from '@supabase/supabase-js';

// Validação rigorosa de variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Função para validar credenciais de forma segura
const validateCredentials = () => {
  // Debug das variáveis de ambiente
  console.log('🔍 Verificando credenciais Supabase...');
  console.log('URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
  console.log('Key:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error('ERRO CRÍTICO: Credenciais Supabase não configuradas');
    console.error('❌', error.message);
    
    if (import.meta.env.PROD) {
      // Em produção, mostrar interface de erro amigável
      throw error;
    } else {
      console.warn('⚠️ Executando em modo desenvolvimento - usando fallback');
      return false;
    }
  }
  
  console.log('✅ Credenciais Supabase validadas com sucesso');
  return true;
};

// Validar credenciais antes de criar cliente
const isValid = validateCredentials();

// SEGURANÇA: Usar variáveis de ambiente com fallback seguro para desenvolvimento
const finalUrl = supabaseUrl || 'https://adxwgpfkvizpqdvortpu.supabase.co';
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});