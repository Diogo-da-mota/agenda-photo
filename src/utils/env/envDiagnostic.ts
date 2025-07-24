/**
 * Verificação e diagnóstico de variáveis de ambiente
 * Este arquivo ajuda a identificar problemas com configurações do Supabase
 */

// Verificar se as variáveis de ambiente estão definidas
const requiredEnvVars = {
  // Para o frontend (Vite)
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  
  // Para verificação geral
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

/**
 * Verificar se todas as variáveis necessárias estão definidas
 */
export function checkEnvironmentVariables(): { isValid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Verificar variáveis obrigatórias
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  for (const varName of required) {
    const value = requiredEnvVars[varName as keyof typeof requiredEnvVars];
    if (!value || value === 'undefined') {
      missing.push(varName);
    }
  }
  
  // Verificar se as URLs são válidas
  if (requiredEnvVars.VITE_SUPABASE_URL) {
    try {
      new URL(requiredEnvVars.VITE_SUPABASE_URL);
    } catch {
      warnings.push('VITE_SUPABASE_URL não é uma URL válida');
    }
  }
  
  // Verificar se a chave anônima parece válida (JWT)
  if (requiredEnvVars.VITE_SUPABASE_ANON_KEY) {
    const parts = requiredEnvVars.VITE_SUPABASE_ANON_KEY.split('.');
    if (parts.length !== 3) {
      warnings.push('VITE_SUPABASE_ANON_KEY não parece ser um JWT válido');
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Exibir relatório das variáveis de ambiente
 */
export function reportEnvironmentStatus(): void {
  const check = checkEnvironmentVariables();
  
  console.group('🔧 Status das Variáveis de Ambiente');
  
  // Mostrar todas as variáveis (sem valores sensíveis)
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    const isSensitive = key.includes('KEY') || key.includes('SECRET');
    const displayValue = isSensitive && value 
      ? `${value.substring(0, 10)}...` 
      : value || '❌ NÃO DEFINIDA';
    
    console.log(`${key}: ${displayValue}`);
  });
  
  // Mostrar problemas
  if (check.missing.length > 0) {
    console.error('❌ Variáveis obrigatórias faltando:', check.missing);
  }
  
  if (check.warnings.length > 0) {
    console.warn('⚠️ Avisos:', check.warnings);
  }
  
  if (check.isValid) {
    console.log('✅ Todas as variáveis obrigatórias estão definidas');
  }
  
  console.groupEnd();
}

/**
 * Verificar conectividade com o Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { VITE_SUPABASE_URL } = requiredEnvVars;
    
    if (!VITE_SUPABASE_URL) {
      return { success: false, error: 'URL do Supabase não definida' };
    }
    
    // Fazer uma requisição simples para verificar conectividade
    const response = await fetch(`${VITE_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': requiredEnvVars.VITE_SUPABASE_ANON_KEY || '',
      }
    });
    
    if (response.ok || response.status === 401) {
      // 401 é esperado para HEAD request sem autenticação adequada
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Executar diagnóstico completo
 */
export async function runEnvironmentDiagnostic(): Promise<void> {
  console.group('🔍 Diagnóstico Completo do Ambiente');
  
  // 1. Verificar variáveis de ambiente
  reportEnvironmentStatus();
  
  // 2. Testar conectividade
  console.log('🌐 Testando conectividade com Supabase...');
  const connectionTest = await testSupabaseConnection();
  
  if (connectionTest.success) {
    console.log('✅ Conectividade com Supabase OK');
  } else {
    console.error('❌ Falha na conectividade:', connectionTest.error);
  }
  
  // 3. Verificar modo de desenvolvimento
  console.log(`🏗️ Modo: ${requiredEnvVars.MODE}`);
  console.log(`🔧 Desenvolvimento: ${requiredEnvVars.DEV}`);
  console.log(`🚀 Produção: ${requiredEnvVars.PROD}`);
  
  console.groupEnd();
}

// Executar diagnóstico automaticamente em desenvolvimento
if (import.meta.env.DEV) {
  // Aguardar um pouco para não interferir com o carregamento inicial
  setTimeout(() => {
    runEnvironmentDiagnostic();
  }, 1000);
}

// Exportar variáveis para uso em outros módulos
export const env = requiredEnvVars;