
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
  build: {
    // Otimizações para o build
    target: "esnext",
    minify: mode === 'production' ? 'esbuild' : false, // Substituir Terser pelo esbuild
    // Remove as opções terserOptions
    // Disable source maps in production to improve performance
    sourcemap: mode !== 'production',
    chunkSizeWarningLimit: 1000, // Aumenta o limite de aviso de tamanho de chunk
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@supabase/supabase-js'
          ],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            'lucide-react'
          ]
        }
      }
    },
    // Improve build speed
    emptyOutDir: true,
    outDir: "dist"
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
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  }
}));
