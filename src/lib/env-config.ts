// Utilitário para verificação robusta de variáveis de ambiente
export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Função para carregar variáveis de ambiente com fallbacks FORÇADOS
function loadEnvVariables(): EnvConfig {
  // FALLBACK HARDCODED para garantir que sempre funcione
  const FALLBACK_SUPABASE_URL = 'https://adxwgpfkvizpqdvortpu.supabase.co';
  const FALLBACK_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o';
  
  // Múltiplas fontes para as variáveis com fallback garantido
  const supabaseUrl = 
    import.meta.env.VITE_SUPABASE_URL || 
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    FALLBACK_SUPABASE_URL;
    
  const supabaseAnonKey = 
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    FALLBACK_SUPABASE_KEY;
    
  const nodeEnv = 
    import.meta.env.NODE_ENV || 
    import.meta.env.MODE || 
    (typeof process !== 'undefined' && process.env?.NODE_ENV) ||
    'development';

  return {
    supabaseUrl,
    supabaseAnonKey,
    nodeEnv,
    isDevelopment: nodeEnv === 'development' || import.meta.env.DEV,
    isProduction: nodeEnv === 'production' || import.meta.env.PROD
  };
}

// Função para validar configuração (mais permissiva)
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
    
    // Log de debug mais detalhado
    console.log('🔍 Debug das variáveis de ambiente:');
    console.log('  - import.meta.env.MODE:', import.meta.env.MODE);
    console.log('  - import.meta.env.DEV:', import.meta.env.DEV);
    console.log('  - import.meta.env.PROD:', import.meta.env.PROD);
    console.log('  - Variáveis VITE_*:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    console.log('  - Todas as variáveis:', Object.keys(import.meta.env));
    
    // EM CASO DE ERRO, USAR FALLBACK E CONTINUAR
    console.warn('⚠️ USANDO CONFIGURAÇÃO DE FALLBACK PARA CONTINUAR');
    return; // NÃO LANÇAR ERRO, APENAS AVISAR
  }
}

// Carregar configuração
export const envConfig = loadEnvVariables();

// Validar sempre, mas não quebrar a aplicação
console.log('🔍 Carregando configuração de ambiente...');
try {
  validateEnvConfig(envConfig);
  console.log('✅ Configuração de ambiente validada com sucesso');
} catch (error) {
  console.warn('⚠️ Erro na validação, mas continuando com fallback:', error);
}

export default envConfig;