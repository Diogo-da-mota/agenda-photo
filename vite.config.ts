import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Headers de segurança básicos para desenvolvimento
const securityHeaders = {
  // Headers básicos de segurança
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN', // Menos restritivo para desenvolvimento
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // CSP mais restritivo para produção
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'nonce-' 'sha256-' 'strict-dynamic'",
    "style-src 'self' 'nonce-' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // FORÇAR MODO DESENVOLVIMENTO para carregar .env
  const isDev = true; // SEMPRE DESENVOLVIMENTO
  
  return {
  server: {
    host: "::",
    port: 8080,
    headers: isDev ? {} : securityHeaders,
    // Configuração HMR para resolver problema de WebSocket
    hmr: {
      port: 8080, // Usar a mesma porta que o servidor
      host: 'localhost'
    },
    // Configuração para SPA - evita redirecionamento no F5
    historyApiFallback: {
      index: '/index.html',
      rewrites: [
        { from: /^\/entrega-fotos\/.*$/, to: '/index.html' },
        { from: /^\/dashboard\/.*$/, to: '/index.html' },
        { from: /^\/portfolio\/.*$/, to: '/index.html' },
        { from: /^\/clientes\/.*$/, to: '/index.html' },
        { from: /^\/agenda\/.*$/, to: '/index.html' },
        { from: /^\/financeiro\/.*$/, to: '/index.html' },
        { from: /^\/contratos\/.*$/, to: '/index.html' },
        { from: /^\/configuracoes\/.*$/, to: '/index.html' },
        { from: /^\/r\/.*$/, to: '/index.html' }
      ]
    },
    // N8N REMOVIDO - Sistema usa Amazon S3
    // Proxy para resolver problema CORS com N8N
    /* COMENTADO - INTEGRAÇÃO N8N REMOVIDA
    proxy: {
      '/api/n8n': {
        target: 'https://webhook.n8n.agendaphoto.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔧 Proxy N8N:', req.method, req.url);
            proxyReq.removeHeader('origin');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📊 N8N Response:', proxyRes.statusCode);
            proxyRes.headers['access-control-allow-origin'] = 'http://localhost:8080';
            proxyRes.headers['access-control-allow-credentials'] = 'true';
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ Proxy Error:', err.message);
          });
        }
      }
    }
    */
  },
  preview: {
    headers: securityHeaders
  },
  plugins: [
    react(),
    isDev && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build config otimizado para evitar constructor errors
  build: {
    sourcemap: false,
    target: 'es2020',
    minify: isDev ? false : 'esbuild',
    rollupOptions: {
      output: {
        // Ofuscar nomes de chunks em produção para segurança
        chunkFileNames: isDev ? '[name]-[hash].js' : '[hash].js',
        assetFileNames: isDev ? '[name]-[hash].[ext]' : '[hash].[ext]',
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // UI Components (separados por tamanho)
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          'icons-vendor': ['lucide-react'],
          
          // Charts (carregamento sob demanda)
          'charts-vendor': ['recharts', 'd3-scale', 'd3-shape'],
          
          // Utilities
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          
          // Form libraries
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod']
        }
      }
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['lovable-tagger']
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
  }; // Fechamento da função
});
