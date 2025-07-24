/**
 * Rate Limiter Client - Versão Simplificada
 * 
 * Removido wrapper problemático que quebrava o Supabase QueryBuilder
 */

import { logger } from './logger';

interface RateLimitResponse {
  allowed: boolean;
  remaining?: number;
  resetTime?: number;
  type?: string;
  error?: string;
  message?: string;
  retryAfter?: number;
}

export class RateLimitError extends Error {
  public readonly status: number = 429;
  public readonly retryAfter: number;
  public readonly type: string = 'RATE_LIMIT_EXCEEDED';

  constructor(message: string, retryAfter: number = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class RateLimiter {
  private readonly baseUrl: string;
  private readonly functionUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.functionUrl = `${this.baseUrl}/functions/v1/rate-limiter`;
  }

  /**
   * Verifica se uma requisição é permitida pelo rate limiter
   */
  private async checkRateLimit(
    type: 'auth' | 'financeiro' | 'default',
    authToken?: string
  ): Promise<RateLimitResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Adicionar token de autorização se disponível
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type })
      });

      const data: RateLimitResponse = await response.json();

      if (response.status === 429) {
        logger.warn(`Rate limit excedido para ${type}`, { remaining: data.remaining }, 'RateLimiter');
        throw new RateLimitError(
          data.message || 'Rate limit excedido',
          data.retryAfter || 60
        );
      }

      logger.debug(`Rate limit verificado para ${type}`, { 
        remaining: data.remaining,
        resetTime: data.resetTime 
      }, 'RateLimiter');

      return data;

    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }

      logger.error('Erro ao verificar rate limit', error, 'RateLimiter');
      
      // Em caso de erro, permitir a requisição (fail-open)
      return { allowed: true };
    }
  }

  /**
   * Middleware para requisições de autenticação
   */
  async checkAuthRateLimit(authToken?: string): Promise<void> {
    const result = await this.checkRateLimit('auth', authToken);
    
    if (!result.allowed) {
      throw new RateLimitError(
        'Muitas tentativas de autenticação. Tente novamente em 1 minuto.',
        result.retryAfter || 60
      );
    }
  }

  /**
   * Aplica rate limiting baseado na URL da requisição
   */
  async applyRateLimit(url: string): Promise<void> {
    // Implementação simplificada - apenas log por enquanto
    logger.debug('Rate limit aplicado para URL', { url }, 'RateLimiter');
  }
}

// Instância singleton do rate limiter
export const rateLimiter = new RateLimiter();

/**
 * Hook para aplicar rate limiting em chamadas de API
 */
export async function withRateLimit<T>(
  operation: () => Promise<T>,
  url: string
): Promise<T> {
  try {
    // Aplicar rate limiting antes da operação
    await rateLimiter.applyRateLimit(url);
    
    // Executar operação
    return await operation();
    
  } catch (error) {
    if (error instanceof RateLimitError) {
      logger.security('Rate limit aplicado', { url, retryAfter: error.retryAfter }, 'RateLimiter');
      throw error;
    }
    
    // Re-throw outros erros
    throw error;
  }
}

/**
 * CORREÇÃO: Função simplificada que não interfere com o Supabase
 * Retorna o cliente original sem modificações
 */
export function createRateLimitedSupabaseClient(supabaseClient: any) {
  // Simplesmente retorna o cliente original sem modificações
  // Isso preserva toda a funcionalidade do Supabase QueryBuilder
  logger.info('Cliente Supabase criado sem rate limiting wrapper', {}, 'RateLimiter');
  return supabaseClient;
} 