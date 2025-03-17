
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
    // Target modern browsers to improve build performance
    target: "esnext",
    // Use esbuild for minification instead of terser
    minify: mode === 'production' ? 'esbuild' : false,
    // Only generate sourcemaps in development
    sourcemap: mode !== 'production',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1500,
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
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
  // Add esbuild options to ensure compatibility
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));
