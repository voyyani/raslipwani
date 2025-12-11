import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable code splitting for better caching and faster initial load
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', '@headlessui/react', 'react-calendar'],
          'vendor-clerk': ['@clerk/clerk-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['react-icons', '@fortawesome/fontawesome-free'],
        }
      }
    },
    // Optimize build using default esbuild minifier (no extra deps required)
    // Note: Removed 'terser' to avoid optional dependency in Vercel builds
    // If you still want to drop console/debugger, consider doing it via babel or during logging.
    // Set chunk size warnings
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps for production debugging (set to false if not needed)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@clerk/clerk-react',
      '@supabase/supabase-js',
    ]
  }
})
