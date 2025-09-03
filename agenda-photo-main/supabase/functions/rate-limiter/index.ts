import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

/**
 * Edge Function para Rate Limiting Persistente
 * 
 * Implementa controle de taxa de requisições para rotas críticas 
 * utilizando armazenamento em banco de dados para persistência entre
 * reinicializações da função.
 * 
 * Limites:
 * - Autenticação: 50 req/min
 * - Transações financeiras: 100 req/min
 * - Default: 100 req/min
 */

interface RateLimitConfig {
  windowMinutes: number; // Janela de tempo em minutos
  maxRequests: number; // Máximo de requisições na janela
  message: string; // Mensagem de erro
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    windowMinutes: 1, // 1 minuto
    maxRequests: 50,
    message: "Muitas tentativas de autenticação. Tente novamente em 1 minuto."
  },
  financeiro: {
    windowMinutes: 1, // 1 minuto  
    maxRequests: 100,
    message: "Muitas requisições financeiras. Tente novamente em 1 minuto."
  },
  default: {
    windowMinutes: 1, // 1 minuto
    maxRequests: 100,
    message: "Muitas requisições. Tente novamente em 1 minuto."
  }
};

// Criar cliente Supabase com service role para acessar funções de rate limiting
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false,
    }
  }
);

function getClientInfo(request: Request): { ip: string; userId: string | null } {
  // Obter IP do cliente
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
  
  // Obter user_id se disponível no header Authorization
  const authHeader = request.headers.get('authorization');
  let userId: string | null = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // Extrair user_id do token JWT (básico, sem verificação completa)
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub || payload.user_id || null;
    } catch (error) {
      // Erro ao extrair user_id do token - logs removidos para produção
    }
  }
  
  return { ip, userId };
}

function getRateLimitType(pathname: string): string {
  if (pathname.includes('/auth/') || pathname.includes('auth')) {
    return 'auth';
  }
  if (pathname.includes('/financeiro/') || pathname.includes('financeiro')) {
    return 'financeiro';
  }
  return 'default';
}

async function checkRateLimit(
  ip: string, 
  endpoint: string, 
  userId: string | null, 
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfter: number }> {
  try {
    // Chamar a função RPC de verificação de rate limit
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', { 
      p_ip: ip,
      p_endpoint: endpoint,
      p_user_id: userId,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes
    });
    
    if (error) {
      // Erro ao verificar rate limit - logs removidos para produção
      // Em caso de erro, permitir a requisição por precaução
      return { allowed: true, retryAfter: 0 };
    }
    
    // data será true se permitido, false se bloqueado
    return { 
      allowed: data === true, 
      retryAfter: config.windowMinutes * 60 // Segundos até reset
    };
  } catch (error) {
    // Erro inesperado no rate limit - logs removidos para produção
    // Em caso de erro, permitir a requisição por precaução
    return { allowed: true, retryAfter: 0 };
  }
}

// Função para limpar registros antigos periodicamente
async function cleanupOldRateLimits() {
  try {
    const { data, error } = await supabaseAdmin.rpc('cleanup_rate_limits', { 
      p_max_age_hours: 24 
    });
    
    if (error) {
      // Erro ao limpar rate limits antigos - logs removidos para produção
    } else {
      // Registros de rate limit antigos removidos - logs removidos para produção
    }
  } catch (error) {
    // Erro inesperado na limpeza - logs removidos para produção
  }
}

Deno.serve(async (req: Request) => {
  // Apenas processar métodos que podem causar mudanças
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Obter tipo de rate limit baseado na rota
    const rateLimitType = getRateLimitType(pathname);
    const config = RATE_LIMITS[rateLimitType];
    
    // Obter informações do cliente
    const { ip, userId } = getClientInfo(req);
    
    // Verificar rate limit
    const { allowed, retryAfter } = await checkRateLimit(
      ip, 
      pathname, 
      userId, 
      config
    );
    
    // Headers de rate limiting
    const rateLimitHeaders = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + retryAfter).toString(),
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };
    
    if (!allowed) {
      // Log da requisição bloqueada - logs removidos para produção
      
      return new Response(
        JSON.stringify({
          error: 'Rate limit excedido',
          message: config.message,
          type: 'RATE_LIMIT_EXCEEDED',
          retryAfter: retryAfter
        }),
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }
    
    // A cada 100 requisições bem sucedidas, limpar registros antigos
    // (uma forma simples de manutenção periódica)
    if (Math.random() < 0.01) { // ~1% das requisições
      cleanupOldRateLimits().catch(() => {}); // Logs removidos para produção
    }
    
    // Requisição permitida - retornar headers informativos
    return new Response(
      JSON.stringify({
        allowed: true,
        type: rateLimitType
      }),
      {
        status: 200,
        headers: rateLimitHeaders
      }
    );
    
  } catch (error) {
    // Erro no rate limiter - logs removidos para produção
    
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        message: 'Erro temporário no controle de taxa'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});