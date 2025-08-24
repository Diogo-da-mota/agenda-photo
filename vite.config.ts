import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Security headers for development and production
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
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
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  server: {
    host: "::",
    port: 8080,
    headers: mode === 'development' ? {} : securityHeaders,
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
  },
  preview: {
    headers: securityHeaders
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
}))