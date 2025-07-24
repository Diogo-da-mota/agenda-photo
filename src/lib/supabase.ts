import { createClient } from '@supabase/supabase-js'

// Função para obter variáveis de ambiente com fallbacks robustos
function getEnvVar(key: string, fallback?: string): string {
  // Primeiro, tenta import.meta.env (Vite)
  let value = import.meta.env?.[key]
  
  // Fallback para process.env (Node.js/SSR)
  if (!value && typeof process !== 'undefined' && process.env) {
    value = process.env[key]
  }
  
  // Fallback para window (browser global)
  if (!value && typeof window !== 'undefined' && (window as any).__ENV__) {
    value = (window as any).__ENV__[key]
  }
  
  // Fallback manual para desenvolvimento
  if (!value && fallback) {
    value = fallback
  }
  
  return value
}

// Configurações hardcoded como fallback de emergência (apenas para desenvolvimento)
const FALLBACK_CONFIG = {
  url: 'https://adxwgpfkvizpqdvortpu.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o'
}

// Obter variáveis de ambiente com fallbacks
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', FALLBACK_CONFIG.url)
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', FALLBACK_CONFIG.key)

// Log de debug para diagnóstico
console.group('🔧 Diagnóstico Supabase')
console.log('📊 import.meta.env:', import.meta.env)
console.log('🌍 Modo:', import.meta.env?.MODE || 'unknown')
console.log('🔗 URL obtida:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'UNDEFINED')
console.log('🔑 Key obtida:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'UNDEFINED')
console.groupEnd()

// Verificação das variáveis de ambiente com mensagens mais claras
if (!supabaseUrl) {
  console.error('❌ ERRO CRÍTICO: VITE_SUPABASE_URL não foi encontrada')
  console.error('📝 Soluções possíveis:')
  console.error('   1. Verifique se o arquivo .env existe na raiz do projeto')
  console.error('   2. Verifique se contém: VITE_SUPABASE_URL=sua_url_aqui')
  console.error('   3. Reinicie o servidor de desenvolvimento (npm run dev)')
  console.error('   4. Limpe o cache: rm -rf node_modules/.vite')
  
  // Em desenvolvimento, usar fallback
  if (import.meta.env?.MODE === 'development') {
    console.warn('⚠️ Usando configuração de fallback para desenvolvimento')
  } else {
    throw new Error('VITE_SUPABASE_URL é obrigatória para conectar com o Supabase')
  }
}

if (!supabaseAnonKey) {
  console.error('❌ ERRO CRÍTICO: VITE_SUPABASE_ANON_KEY não foi encontrada')
  console.error('📝 Soluções possíveis:')
  console.error('   1. Verifique se o arquivo .env existe na raiz do projeto')
  console.error('   2. Verifique se contém: VITE_SUPABASE_ANON_KEY=sua_chave_aqui')
  console.error('   3. Reinicie o servidor de desenvolvimento (npm run dev)')
  console.error('   4. Limpe o cache: rm -rf node_modules/.vite')
  
  // Em desenvolvimento, usar fallback
  if (import.meta.env?.MODE === 'development') {
    console.warn('⚠️ Usando configuração de fallback para desenvolvimento')
  } else {
    throw new Error('VITE_SUPABASE_ANON_KEY é obrigatória para conectar com o Supabase')
  }
}

// Verificar se a URL é válida
if (supabaseUrl) {
  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.error('❌ ERRO CRÍTICO: VITE_SUPABASE_URL não é uma URL válida:', supabaseUrl)
    throw new Error('VITE_SUPABASE_URL deve ser uma URL válida')
  }
}

// Verificar se a chave parece ser um JWT válido
if (supabaseAnonKey && (!supabaseAnonKey.includes('.') || supabaseAnonKey.split('.').length !== 3)) {
  console.error('❌ ERRO CRÍTICO: VITE_SUPABASE_ANON_KEY não parece ser um JWT válido')
  console.error('💡 A chave deve ter o formato: header.payload.signature')
  throw new Error('VITE_SUPABASE_ANON_KEY deve ser um JWT válido')
}

console.log('✅ Configuração do Supabase validada com sucesso')
console.log('🔗 URL:', supabaseUrl)
console.log('🔑 Chave:', `${supabaseAnonKey?.substring(0, 20)}...`)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)