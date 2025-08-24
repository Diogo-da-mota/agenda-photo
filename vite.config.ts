<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
=======
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
  
  // CSP mais permissivo para desenvolvimento/preview
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.io wss://*.supabase.io",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: mode === 'development' ? {} : securityHeaders,
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
            proxyReq.removeHeader('origin');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = 'http://localhost:8080';
            proxyRes.headers['access-control-allow-credentials'] = 'true';
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
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
<<<<<<< Updated upstream
=======
>>>>>>> 3a0f733958fd3439ae43a47af2271af6d51c9d47
>>>>>>> Stashed changes
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8081,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-dialog'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})