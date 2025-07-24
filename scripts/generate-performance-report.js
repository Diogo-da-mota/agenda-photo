#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para ler métricas do localStorage (simulado)
const generateMockMetrics = () => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  return {
    webVitals: [
      { name: 'LCP', value: 2100, rating: 'good', timestamp: now - 30000, url: '/portfolio' },
      { name: 'FCP', value: 1200, rating: 'good', timestamp: now - 25000, url: '/portfolio' },
      { name: 'CLS', value: 0.05, rating: 'good', timestamp: now - 20000, url: '/portfolio' },
      { name: 'INP', value: 150, rating: 'good', timestamp: now - 15000, url: '/portfolio' },
      { name: 'TTFB', value: 400, rating: 'needs-improvement', timestamp: now - 10000, url: '/portfolio' }
    ],
    apiCalls: [
      { endpoint: '/rest/v1/trabalhos_portfolio', duration: 250, success: true, timestamp: now - 5000 },
      { endpoint: '/rest/v1/clientes', duration: 180, success: true, timestamp: now - 8000 },
      { endpoint: '/storage/v1/object/portfolio', duration: 450, success: true, timestamp: now - 12000 }
    ],
    componentRenders: [
      { name: 'Portfolio_mount', duration: 45, rating: 'good', timestamp: now - 3000 },
      { name: 'PortfolioGrid_update', duration: 12, rating: 'good', timestamp: now - 2000 },
      { name: 'PortfolioCard_mount', duration: 8, rating: 'good', timestamp: now - 1000 }
    ]
  };
};

// Função para analisar métricas
const analyzeMetrics = (metrics) => {
  const analysis = {
    webVitals: {
      good: 0,
      needsImprovement: 0,
      poor: 0,
      total: metrics.webVitals.length
    },
    api: {
      averageResponseTime: 0,
      slowRequests: 0,
      total: metrics.apiCalls.length
    },
    rendering: {
      averageRenderTime: 0,
      slowRenders: 0,
      total: metrics.componentRenders.length
    },
    alerts: []
  };

  // Analisar Web Vitals
  metrics.webVitals.forEach(metric => {
    analysis.webVitals[metric.rating]++;
  });

  // Analisar API calls
  if (metrics.apiCalls.length > 0) {
    const totalApiTime = metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    analysis.api.averageResponseTime = Math.round(totalApiTime / metrics.apiCalls.length);
    analysis.api.slowRequests = metrics.apiCalls.filter(call => call.duration > 300).length;
  }

  // Analisar renderização
  if (metrics.componentRenders.length > 0) {
    const totalRenderTime = metrics.componentRenders.reduce((sum, render) => sum + render.duration, 0);
    analysis.rendering.averageRenderTime = Math.round(totalRenderTime / metrics.componentRenders.length);
    analysis.rendering.slowRenders = metrics.componentRenders.filter(render => render.duration > 50).length;
  }

  // Gerar alertas
  if (analysis.api.averageResponseTime > 300) {
    analysis.alerts.push({
      type: 'WARNING',
      message: `Tempo médio de resposta da API acima do threshold: ${analysis.api.averageResponseTime}ms > 300ms`
    });
  }

  if (analysis.rendering.slowRenders > 0) {
    analysis.alerts.push({
      type: 'WARNING',
      message: `${analysis.rendering.slowRenders} renderizações lentas detectadas (>50ms)`
    });
  }

  const poorWebVitalsPercentage = (analysis.webVitals.poor / analysis.webVitals.total) * 100;
  if (poorWebVitalsPercentage > 25) {
    analysis.alerts.push({
      type: 'ERROR',
      message: `${Math.round(poorWebVitalsPercentage)}% das métricas Web Vitals estão em estado "poor"`
    });
  }

  return analysis;
};

// Função para gerar relatório HTML
const generateHTMLReport = (metrics, analysis) => {
  const timestamp = new Date().toLocaleString('pt-BR');
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Performance - Agenda Pro</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; }
        .metric-title { font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .metric-value { font-size: 24px; font-weight: 700; color: #0f172a; }
        .metric-subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
        .alert { padding: 12px; border-radius: 6px; margin: 8px 0; }
        .alert-warning { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; }
        .alert-error { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; }
        .good { color: #059669; }
        .warning { color: #d97706; }
        .poor { color: #dc2626; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Relatório de Performance</h1>
            <p>Agenda Pro - Gerado em ${timestamp}</p>
        </div>
        
        <div class="content">
            ${analysis.alerts.length > 0 ? `
            <h2>🚨 Alertas</h2>
            ${analysis.alerts.map(alert => `
                <div class="alert alert-${alert.type.toLowerCase()}">
                    <strong>${alert.type}:</strong> ${alert.message}
                </div>
            `).join('')}
            ` : '<div class="alert" style="background: #dcfce7; border: 1px solid #16a34a; color: #166534;">✅ Nenhum alerta detectado</div>'}
            
            <h2>📈 Resumo das Métricas</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Web Vitals</div>
                    <div class="metric-value">
                        <span class="good">${analysis.webVitals.good}</span> / 
                        <span class="warning">${analysis.webVitals.needsImprovement}</span> / 
                        <span class="poor">${analysis.webVitals.poor}</span>
                    </div>
                    <div class="metric-subtitle">Bom / Precisa Melhorar / Ruim</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Tempo Médio de API</div>
                    <div class="metric-value ${analysis.api.averageResponseTime > 300 ? 'warning' : 'good'}">
                        ${analysis.api.averageResponseTime}ms
                    </div>
                    <div class="metric-subtitle">Threshold: 300ms</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Renderização Média</div>
                    <div class="metric-value ${analysis.rendering.averageRenderTime > 50 ? 'warning' : 'good'}">
                        ${analysis.rendering.averageRenderTime}ms
                    </div>
                    <div class="metric-subtitle">Threshold: 50ms</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Requisições Lentas</div>
                    <div class="metric-value ${analysis.api.slowRequests > 0 ? 'warning' : 'good'}">
                        ${analysis.api.slowRequests}
                    </div>
                    <div class="metric-subtitle">de ${analysis.api.total} total</div>
                </div>
            </div>
            
            <h2>🔍 Detalhes das Métricas</h2>
            
            <h3>Web Vitals</h3>
            <table>
                <thead>
                    <tr><th>Métrica</th><th>Valor</th><th>Rating</th><th>Página</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                    ${metrics.webVitals.map(metric => `
                        <tr>
                            <td>${metric.name}</td>
                            <td>${metric.value}${metric.name === 'CLS' ? '' : 'ms'}</td>
                            <td class="${metric.rating}">${metric.rating}</td>
                            <td>${metric.url}</td>
                            <td>${new Date(metric.timestamp).toLocaleString('pt-BR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h3>Chamadas de API</h3>
            <table>
                <thead>
                    <tr><th>Endpoint</th><th>Duração</th><th>Status</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                    ${metrics.apiCalls.map(call => `
                        <tr>
                            <td>${call.endpoint}</td>
                            <td class="${call.duration > 300 ? 'warning' : 'good'}">${call.duration}ms</td>
                            <td class="${call.success ? 'good' : 'poor'}">${call.success ? 'Sucesso' : 'Erro'}</td>
                            <td>${new Date(call.timestamp).toLocaleString('pt-BR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h3>Renderização de Componentes</h3>
            <table>
                <thead>
                    <tr><th>Componente</th><th>Duração</th><th>Rating</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                    ${metrics.componentRenders.map(render => `
                        <tr>
                            <td>${render.name}</td>
                            <td class="${render.duration > 50 ? 'warning' : 'good'}">${render.duration}ms</td>
                            <td class="${render.rating}">${render.rating}</td>
                            <td>${new Date(render.timestamp).toLocaleString('pt-BR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
  `;
};

// Função principal
const main = () => {
  console.log('🔄 Gerando relatório de performance...');
  
  // Em produção, isso leria dados reais do localStorage ou de um endpoint
  const metrics = generateMockMetrics();
  const analysis = analyzeMetrics(metrics);
  
  // Gerar relatório HTML
  const htmlReport = generateHTMLReport(metrics, analysis);
  
  // Criar diretório de relatórios se não existir
  const reportsDir = path.join(process.cwd(), 'performance-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Salvar relatório
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `performance-report-${timestamp}.html`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, htmlReport);
  
  console.log(`✅ Relatório gerado: ${filepath}`);
  console.log(`📊 Resumo:`);
  console.log(`   - Web Vitals: ${analysis.webVitals.good} bom, ${analysis.webVitals.needsImprovement} precisa melhorar, ${analysis.webVitals.poor} ruim`);
  console.log(`   - API: ${analysis.api.averageResponseTime}ms tempo médio, ${analysis.api.slowRequests} requisições lentas`);
  console.log(`   - Renderização: ${analysis.rendering.averageRenderTime}ms tempo médio, ${analysis.rendering.slowRenders} renderizações lentas`);
  console.log(`   - Alertas: ${analysis.alerts.length}`);
  
  if (analysis.alerts.length > 0) {
    console.log('\n🚨 Alertas:');
    analysis.alerts.forEach(alert => {
      console.log(`   ${alert.type}: ${alert.message}`);
    });
  }
};

// Executar sempre que o script for chamado diretamente
main();

export { generateMockMetrics, analyzeMetrics, generateHTMLReport }; 