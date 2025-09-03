/**
 * Rate Limiting para proteção contra ataques de força bruta
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimit {
  private attempts = new Map<string, RateLimitRecord>();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutos
  ) {}

  /**
   * Verifica se uma ação está dentro do limite de rate
   * @param key Identificador único (IP, user ID, etc.)
   * @returns true se permitido, false se bloqueado
   */
  check(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    // Reset se passou do tempo limite
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { 
        count: 1, 
        resetTime: now + this.windowMs 
      });
      return true;
    }

    // Verificar limite
    if (record.count >= this.maxAttempts) {
      console.warn(`Rate limit exceeded for key: ${key}`);
      return false;
    }

    // Incrementar tentativas
    record.count++;
    return true;
  }

  /**
   * Reset manual do contador para uma chave
   * @param key Identificador a ser resetado
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Obtém informações sobre o status atual de uma chave
   * @param key Identificador
   * @returns Informações sobre tentativas restantes
   */
  getStatus(key: string): { remaining: number; resetTime: number } {
    const record = this.attempts.get(key);
    
    if (!record || Date.now() > record.resetTime) {
      return { remaining: this.maxAttempts, resetTime: 0 };
    }

    return {
      remaining: Math.max(0, this.maxAttempts - record.count),
      resetTime: record.resetTime
    };
  }

  /**
   * Limpa registros expirados para evitar vazamento de memória
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// Instâncias globais para diferentes tipos de rate limiting
export const loginRateLimit = new RateLimit(5, 15 * 60 * 1000); // 5 tentativas por 15 min
export const apiRateLimit = new RateLimit(100, 60 * 1000); // 100 req por minuto
export const uploadRateLimit = new RateLimit(10, 60 * 1000); // 10 uploads por minuto

// Cleanup automático a cada 5 minutos
setInterval(() => {
  loginRateLimit.cleanup();
  apiRateLimit.cleanup();
  uploadRateLimit.cleanup();
}, 5 * 60 * 1000);