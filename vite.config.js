import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // The same alias vitest.config.js declares. It lived in only one of the two
  // configs, so `@/utils/supabaseClient` resolved under test and not under
  // build — which is why source files reached for relative paths instead, and
  // why the global Supabase mock (keyed on the `@` specifier) silently missed
  // every one of them. Both resolvers now agree.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Enable code splitting for better caching and faster initial load
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'react-calendar'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
        }
      }
    },
    // Set chunk size warnings
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps for production debugging (set to false if not needed)
    sourcemap: false,
  },
  // esbuild is already the minifier and can drop these itself — no terser and no
  // babel plugin required, contrary to the note this replaced. Scoped to `build`
  // only: Vite applies `esbuild` to the dev transform as well, and dropping
  // `console` there would silence the very diagnostics it exists to preserve.
  esbuild:
    command === 'build'
      ? { drop: ['console', 'debugger'] }
      : {},
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@supabase/supabase-js',
    ]
  }
}))
