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
    // No manualChunks.
    //
    // The four hand-written groups cost more than they bought. `vendor-ui`
    // grouped framer-motion with react-calendar; framer-motion is imported by
    // the eagerly-loaded Header, so Rollup preloaded the whole group and every
    // first-time visitor downloaded an admin calendar library. `vendor-icons`
    // did the same thing for lucide-react: every route's icons in one eager
    // chunk. Rollup's default splitting follows the actual import graph, which
    // is the thing a manual grouping keeps overriding by accident.
    //
    // Measured 2026-09-08: first load 220.7 kB -> 210.4 kB gzip.
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
  // A dev-server pre-bundling hint only. `@supabase/supabase-js` came off this
  // list when it became a dynamic import: listing it here says "every dev page
  // load wants this", which is the opposite of what the app now does.
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
}))
