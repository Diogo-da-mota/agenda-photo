
import { supabase } from '@/lib/supabase';
import { RateLimitError } from '@/utils/rateLimiter';
import { logger } from '@/utils/logger';
import { TestResult } from './types';

export const executeAuthRateLimit = async (
  addResult: (result: TestResult) => void,
  onToast: (title: string, description: string, variant?: 'default' | 'destructive') => void
): Promise<void> => {
  const testEmail = `teste${Date.now()}@example.com`;
  const testPassword = 'TesteSeguro123!';
  
  onToast(
    "Teste de Rate Limiting - Autenticação",
    "Iniciando teste com 51 tentativas de cadastro...",
    "default"
  );

  for (let i = 1; i <= 51; i++) {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${testEmail}${i}`,
        password: testPassword,
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error && error.message.includes('rate')) {
        addResult({
          timestamp: new Date().toLocaleTimeString(),
          action: `Cadastro ${i}/51`,
          success: false,
          error: 'Rate limit atingido (esperado)',
          responseTime
        });
        
        logger.info(`Rate limit atingido na tentativa ${i}`, null, 'RateLimitTest');
        break;
      } else {
        addResult({
          timestamp: new Date().toLocaleTimeString(),
          action: `Cadastro ${i}/51`,
          success: true,
          responseTime
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof RateLimitError) {
        addResult({
          timestamp: new Date().toLocaleTimeString(),
          action: `Cadastro ${i}/51`,
          success: false,
          error: `Rate limit: ${error.message}`,
          responseTime
        });
        
        onToast(
          "Rate Limit Funcionando!",
          `Bloqueado na tentativa ${i} - ${error.message}`,
          "default"
        );
        
        break;
      } else {
        addResult({
          timestamp: new Date().toLocaleTimeString(),
          action: `Cadastro ${i}/51`,
          success: false,
          error: (error as Error).message,
          responseTime
        });
      }
    }
    
    // Pequeno delay para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
