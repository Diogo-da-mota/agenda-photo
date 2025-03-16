
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
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@/components/ui'],
        },
      },
    },
    // Reduzir tamanho do pacote final
    chunkSizeWarningLimit: 1000,
    // Definir navegadores alvo diretamente sem usar browserslist
    target: 'es2015',
    // Forçar atualização do browserslist durante o build
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      defaultIsModuleExports: true,
    },
    // Garantir compatibilidade com navegadores modernos
    modulePreload: {
      polyfill: true,
    },
    // Aumentar limite de tempo para evitar timeouts durante o build
    assetsInlineLimit: 4096,
    // Otimizar a geração de assets
    cssCodeSplit: true,
    sourcemap: false,
  },
  // Desabilitar verificações de browserlist durante o desenvolvimento
  esbuild: {
    target: 'es2015',
    legalComments: 'none',
  },
}));
