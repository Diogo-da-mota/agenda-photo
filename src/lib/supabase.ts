import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Função para obter variáveis de ambiente com validação
function getEnvVar(key: string): string | undefined {
  return import.meta.env[key]
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

// Validação robusta das credenciais do Supabase
function validateAndCreateSupabaseClient(): SupabaseClient {
  // Verificar se as variáveis existem e não são strings vazias
  const isUrlValid = supabaseUrl && supabaseUrl.trim() !== '' && supabaseUrl !== 'undefined'
  const isKeyValid = supabaseAnonKey && supabaseAnonKey.trim() !== '' && supabaseAnonKey !== 'undefined'
  
  if (!isUrlValid || !isKeyValid) {
    const errorMsg = `Supabase credentials missing or invalid:\n` +
      `- URL: ${isUrlValid ? '✅' : '❌'} (${supabaseUrl ? 'present' : 'missing'})\n` +
      `- Key: ${isKeyValid ? '✅' : '❌'} (${supabaseAnonKey ? 'present' : 'missing'})\n` +
      `- Mode: ${import.meta.env.MODE}\n` +
      `- Environment variables may not be loaded correctly.`
    
    throw new Error(errorMsg)
  }
  
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
    
    return client
  } catch (error) {
    throw new Error(`Failed to create Supabase client: ${error}`)
  }
}

// Criar cliente com validação robusta
export const supabase = validateAndCreateSupabaseClient()