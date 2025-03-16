
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Otimizações de build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Melhorar divisão de código
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            } else if (id.includes('ui')) {
              return 'ui-components';
            }
            return 'vendor'; // outros node_modules
          }
        },
      },
    },
    // Reduzir tamanho do pacote final
    chunkSizeWarningLimit: 1500,
    // Definir navegadores alvo para compatibilidade
    target: 'es2015',
    // Prevenir o erro EISDIR
    emptyOutDir: true,
    // Melhorar compatibilidade com CommonJS
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      requireReturnsDefault: 'auto',
      defaultIsModuleExports: true,
    },
    // Garantir compatibilidade com navegadores modernos
    modulePreload: {
      polyfill: true,
    },
    // Configurações adicionais para melhorar a estabilidade
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
  },
  // Desabilitar verificações de browserlist durante o desenvolvimento
  esbuild: {
    target: 'es2015',
    legalComments: 'none',
    supported: {
      'top-level-await': true
    },
  },
  // Otimizar o processo de resolução de dependências
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2015',
      supported: { 
        bigint: true 
      },
    },
    exclude: [],
  }
}));
