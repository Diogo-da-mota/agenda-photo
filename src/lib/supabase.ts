import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificação das variáveis de ambiente
if (!supabaseUrl) {
  console.error('❌ ERRO CRÍTICO: VITE_SUPABASE_URL não está definida no arquivo .env');
  console.error('📝 Verifique se o arquivo .env contém: VITE_SUPABASE_URL=sua_url_aqui');
  throw new Error('VITE_SUPABASE_URL é obrigatória para conectar com o Supabase');
}

if (!supabaseAnonKey) {
  console.error('❌ ERRO CRÍTICO: VITE_SUPABASE_ANON_KEY não está definida no arquivo .env');
  console.error('📝 Verifique se o arquivo .env contém: VITE_SUPABASE_ANON_KEY=sua_chave_aqui');
  throw new Error('VITE_SUPABASE_ANON_KEY é obrigatória para conectar com o Supabase');
}

// Verificar se a URL é válida
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('❌ ERRO CRÍTICO: VITE_SUPABASE_URL não é uma URL válida:', supabaseUrl);
  throw new Error('VITE_SUPABASE_URL deve ser uma URL válida');
}

// Verificar se a chave parece ser um JWT válido
if (!supabaseAnonKey.includes('.') || supabaseAnonKey.split('.').length !== 3) {
  console.error('❌ ERRO CRÍTICO: VITE_SUPABASE_ANON_KEY não parece ser um JWT válido');
  console.error('💡 A chave deve ter o formato: header.payload.signature');
  throw new Error('VITE_SUPABASE_ANON_KEY deve ser um JWT válido');
}

console.log('✅ Configuração do Supabase validada com sucesso');
console.log('🔗 URL:', supabaseUrl);
console.log('🔑 Chave:', `${supabaseAnonKey.substring(0, 20)}...`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey)