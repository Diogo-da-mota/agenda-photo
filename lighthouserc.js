export default {
  ci: {
    collect: {
      // URLs para auditar
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/portfolio',
        'http://localhost:5173/portfolio/galeria',
        'http://localhost:5173/login'
      ],
      // Configurações de coleta
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        // Simular dispositivo móvel para algumas auditorias
        emulatedFormFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      // Thresholds conforme auditoria
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        // Web Vitals específicos
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
        // Métricas de rede
        'server-response-time': ['warn', { maxNumericValue: 300 }],
        'interactive': ['warn', { maxNumericValue: 5000 }]
      }
    },
    upload: {
      // Configurar para salvar relatórios localmente em desenvolvimento
      target: 'filesystem',
      outputDir: './lighthouse-reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%'
    },
    server: {
      // Configuração para servidor local
      port: 9001,
      storage: './lighthouse-server-storage'
    }
  }
};