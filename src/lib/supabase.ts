import { createClient } from '@supabase/supabase-js';

// Configuração robusta do Supabase com fallbacks seguros
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://adxwgpfkvizpqdvortpu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o';

// Validação das credenciais
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Credenciais Supabase não configuradas');
  throw new Error('Credenciais Supabase não configuradas. Verifique as variáveis de ambiente.');
}

// Log de sucesso apenas em desenvolvimento
if (import.meta.env.DEV) {
  console.log('✅ Supabase configurado com sucesso');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});