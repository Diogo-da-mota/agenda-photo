
import { supabase } from '@/lib/supabase';
import { criarTransacao } from '@/services/financeiroService';
import { RateLimitError } from '@/utils/rateLimiter';
import { logger } from '@/utils/logger';
import { TestResult } from './types';

export const executeFinanceiroRateLimit = async (
  addResult: (result: TestResult) => void,
  onToast: (title: string, description: string, variant?: 'default' | 'destructive') => void
): Promise<void> => {
  try {
    // Verificar se usuário está autenticado
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      onToast(
        "Erro",
        "Usuário não autenticado. Faça login primeiro.",
        "destructive"
      );
      return;
    }

    onToast(
      "Teste de Rate Limiting - Financeiro",
      "Iniciando teste com 101 tentativas de criação de transação...",
      "default"
    );

    for (let i = 1; i <= 101; i++) {
      const startTime = Date.now();
      
      try {
        const transacao = {
          descricao: `Transação teste ${i}`,
          valor: 10 + i,
          tipo: 'receita' as const,
          status: 'pendente' as const,
          data_transacao: new Date().toISOString().split('T')[0],
          categoria: 'teste',
          clienteName: `Cliente Teste ${i}`,
          user_id: userData.user.id
        };
        
        await criarTransacao(transacao, userData.user.id);
        
        const responseTime = Date.now() - startTime;
        
        addResult({
          timestamp: new Date().toLocaleTimeString(),
          action: `Transação ${i}/101`,
          success: true,
          responseTime
        });
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        if (error instanceof RateLimitError) {
          addResult({
            timestamp: new Date().toLocaleTimeString(),
            action: `Transação ${i}/101`,
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
            action: `Transação ${i}/101`,
            success: false,
            error: (error as Error).message,
            responseTime
          });
          
          // Se não é rate limit mas muitas tentativas, parar para evitar spam
          if (i > 10) break;
        }
      }
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
  } catch (error) {
    logger.error('Erro no teste de rate limiting financeiro', error, 'RateLimitTest');
    onToast(
      "Erro no teste",
      (error as Error).message,
      "destructive"
    );
  }
};
