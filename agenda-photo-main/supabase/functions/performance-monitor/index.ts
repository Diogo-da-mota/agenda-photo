import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userId?: string;
}

interface APIMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  timestamp: number;
  userId?: string;
}

// Thresholds conforme auditoria
const THRESHOLDS = {
  API_RESPONSE_TIME: 300, // ms
  CACHE_HIT_RATE: 0.8, // 80%
  ERROR_RATE: 0.1, // 10%
  LCP_THRESHOLD: 4000, // ms
  CLS_THRESHOLD: 0.25,
  TTFB_THRESHOLD: 1800 // ms
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method } = req;
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (method) {
      case 'POST':
        if (action === 'metrics') {
          return await handleMetrics(req, supabaseClient);
        } else if (action === 'alert') {
          return await handleAlert(req, supabaseClient);
        }
        break;
      
      case 'GET':
        if (action === 'health') {
          return await handleHealthCheck(supabaseClient);
        } else if (action === 'stats') {
          return await handleGetStats(supabaseClient);
        }
        break;
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint não encontrado' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    // Erro na função - logs removidos para produção
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Processar métricas recebidas
async function handleMetrics(req: Request, supabase: any) {
  const metrics = await req.json();
  
  // Métricas recebidas - logs removidos para produção
  
  // Analisar métricas e gerar alertas se necessário
  const alerts = analyzeMetrics(metrics);
  
  // Salvar métricas no banco (opcional)
  if (metrics.length > 0) {
    const { error } = await supabase
      .from('performance_metrics')
      .insert(metrics.map((metric: PerformanceMetric | APIMetric) => ({
        ...metric,
        created_at: new Date().toISOString()
      })));
    
    if (error) {
      // Erro ao salvar métricas - logs removidos para produção
    }
  }
  
  // Enviar alertas se necessário
  for (const alert of alerts) {
    await sendAlert(alert, supabase);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      processed: metrics.length,
      alerts: alerts.length 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Analisar métricas e detectar problemas
function analyzeMetrics(metrics: (PerformanceMetric | APIMetric)[]): any[] {
  const alerts = [];
  
  for (const metric of metrics) {
    // Verificar Web Vitals
    if ('rating' in metric) {
      if (metric.name === 'LCP' && metric.value > THRESHOLDS.LCP_THRESHOLD) {
        alerts.push({
          type: 'PERFORMANCE_ALERT',
          severity: 'WARNING',
          message: `LCP acima do threshold: ${metric.value}ms > ${THRESHOLDS.LCP_THRESHOLD}ms`,
          metric: metric.name,
          value: metric.value,
          url: metric.url,
          timestamp: metric.timestamp
        });
      }
      
      if (metric.name === 'CLS' && metric.value > THRESHOLDS.CLS_THRESHOLD) {
        alerts.push({
          type: 'PERFORMANCE_ALERT',
          severity: 'WARNING',
          message: `CLS acima do threshold: ${metric.value} > ${THRESHOLDS.CLS_THRESHOLD}`,
          metric: metric.name,
          value: metric.value,
          url: metric.url,
          timestamp: metric.timestamp
        });
      }
      
      if (metric.name === 'TTFB' && metric.value > THRESHOLDS.TTFB_THRESHOLD) {
        alerts.push({
          type: 'PERFORMANCE_ALERT',
          severity: 'WARNING',
          message: `TTFB acima do threshold: ${metric.value}ms > ${THRESHOLDS.TTFB_THRESHOLD}ms`,
          metric: metric.name,
          value: metric.value,
          url: metric.url,
          timestamp: metric.timestamp
        });
      }
    }
    
    // Verificar APIs
    if ('duration' in metric && 'endpoint' in metric) {
      if (metric.duration > THRESHOLDS.API_RESPONSE_TIME) {
        alerts.push({
          type: 'API_ALERT',
          severity: metric.duration > 1000 ? 'ERROR' : 'WARNING',
          message: `API lenta detectada: ${metric.endpoint} - ${metric.duration}ms > ${THRESHOLDS.API_RESPONSE_TIME}ms`,
          endpoint: metric.endpoint,
          duration: metric.duration,
          timestamp: metric.timestamp
        });
      }
      
      if (!metric.success) {
        alerts.push({
          type: 'API_ALERT',
          severity: 'ERROR',
          message: `Falha na API: ${metric.endpoint} - Status ${metric.status}`,
          endpoint: metric.endpoint,
          status: metric.status,
          timestamp: metric.timestamp
        });
      }
    }
  }
  
  return alerts;
}

// Enviar alerta
async function sendAlert(alert: any, supabase: any) {
  // Alerta de performance - logs removidos para produção
  
  // Salvar alerta no banco
  const { error } = await supabase
    .from('performance_alerts')
    .insert({
      ...alert,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    // Erro ao salvar alerta - logs removidos para produção
  }
  
  // Em produção, aqui você poderia enviar notificações via:
  // - Email
  // - Slack
  // - Discord
  // - SMS
  // - Push notifications
}

// Health check do sistema
async function handleHealthCheck(supabase: any) {
  const startTime = Date.now();
  
  try {
    // Testar conectividade com o banco
    const { data, error } = await supabase
      .from('clientes')
      .select('count')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return new Response(
        JSON.stringify({ 
          status: 'unhealthy', 
          error: error.message,
          responseTime 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Verificar se o tempo de resposta está dentro do threshold
    const isHealthy = responseTime < THRESHOLDS.API_RESPONSE_TIME;
    
    return new Response(
      JSON.stringify({ 
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        threshold: THRESHOLDS.API_RESPONSE_TIME,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy', 
        error: 'Falha na conectividade',
        responseTime: Date.now() - startTime
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Obter estatísticas de performance
async function handleGetStats(supabase: any) {
  try {
    // Buscar métricas das últimas 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: metrics, error: metricsError } = await supabase
      .from('performance_metrics')
      .select('*')
      .gte('created_at', oneDayAgo);
    
    const { data: alerts, error: alertsError } = await supabase
      .from('performance_alerts')
      .select('*')
      .gte('created_at', oneDayAgo);
    
    if (metricsError || alertsError) {
      throw new Error('Erro ao buscar dados');
    }
    
    // Calcular estatísticas
    const stats = {
      totalMetrics: metrics?.length || 0,
      totalAlerts: alerts?.length || 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastUpdate: new Date().toISOString()
    };
    
    // Calcular tempo médio de resposta das APIs
    const apiMetrics = metrics?.filter(m => m.endpoint) || [];
    if (apiMetrics.length > 0) {
      stats.averageResponseTime = apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length;
    }
    
    // Calcular taxa de erro
    const totalRequests = apiMetrics.length;
    const failedRequests = apiMetrics.filter(m => !m.success).length;
    if (totalRequests > 0) {
      stats.errorRate = failedRequests / totalRequests;
    }
    
    return new Response(
      JSON.stringify(stats),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao obter estatísticas' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Processar alerta manual
async function handleAlert(req: Request, supabase: any) {
  const alertData = await req.json();
  
  await sendAlert(alertData, supabase);
  
  return new Response(
    JSON.stringify({ success: true }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}