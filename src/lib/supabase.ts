import { createClient } from '@supabase/supabase-js';
import { envConfig, validateEnvConfig } from './env-config';

// Validar configuração antes de criar o cliente
try {
  validateEnvConfig(envConfig);
  
  if (envConfig.isDevelopment) {
    console.log('🚀 Inicializando cliente Supabase...');
    console.log('  - URL configurada:', envConfig.supabaseUrl.substring(0, 30) + '...');
    console.log('  - Key configurada:', envConfig.supabaseAnonKey.substring(0, 20) + '...');
  }
} catch (error) {
  console.error('❌ ERRO CRÍTICO na configuração do Supabase:', error);
  throw error;
}

// Criar cliente Supabase
export const supabase = createClient(envConfig.supabaseUrl, envConfig.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log de sucesso apenas em desenvolvimento
if (envConfig.isDevelopment) {
  console.log('✅ Cliente Supabase inicializado com sucesso');
}