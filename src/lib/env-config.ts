// Utilitário para verificação robusta de variáveis de ambiente
export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Função para carregar variáveis de ambiente com fallbacks
function loadEnvVariables(): EnvConfig {
  // Múltiplas fontes para as variáveis
  const supabaseUrl = 
    import.meta.env.VITE_SUPABASE_URL || 
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    '';
    
  const supabaseAnonKey = 
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    '';
    
  const nodeEnv = 
    import.meta.env.NODE_ENV || 
    import.meta.env.MODE || 
    (typeof process !== 'undefined' && process.env?.NODE_ENV) ||
    'development';

  return {
    supabaseUrl,
    supabaseAnonKey,
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production'
  };
}

// Função para validar configuração
export function validateEnvConfig(config: EnvConfig): void {
  const errors: string[] = [];

  if (!config.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL não está definida');
  } else if (!config.supabaseUrl.startsWith('https://') || !config.supabaseUrl.includes('.supabase.co')) {
    errors.push('VITE_SUPABASE_URL deve ser uma URL válida do Supabase');
  }

  if (!config.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY não está definida');
  } else if (config.supabaseAnonKey.length < 100) {
    errors.push('VITE_SUPABASE_ANON_KEY parece inválida (muito curta)');
  }

  if (errors.length > 0) {
    console.error('❌ Erros de configuração encontrados:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    // Log de debug
    console.log('🔍 Debug das variáveis de ambiente:');
    console.log('  - import.meta.env.MODE:', import.meta.env.MODE);
    console.log('  - import.meta.env.DEV:', import.meta.env.DEV);
    console.log('  - import.meta.env.PROD:', import.meta.env.PROD);
    console.log('  - Variáveis VITE_*:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    
    throw new Error(`Configuração inválida: ${errors.join(', ')}`);
  }
}

// Carregar e validar configuração
export const envConfig = loadEnvVariables();

// Validar apenas em desenvolvimento para debug
if (envConfig.isDevelopment) {
  console.log('🔍 Carregando configuração de ambiente...');
  try {
    validateEnvConfig(envConfig);
    console.log('✅ Configuração de ambiente validada com sucesso');
  } catch (error) {
    console.error('❌ Erro na validação da configuração:', error);
    throw error;
  }
}

export default envConfig;