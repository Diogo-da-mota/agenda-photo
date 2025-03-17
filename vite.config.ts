
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
    // Ensure we have sufficient memory for the build process
    target: "esnext",
    minify: "terser",
    terserOptions: {
      output: {
        comments: false,
      },
    },
    // Disable source maps in production to improve performance
    sourcemap: mode !== 'production',
    // Specify the browser compatibility target
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
}));
