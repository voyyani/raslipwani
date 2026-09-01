import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.jsx',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**'
      ],
      // Ratcheting floor: raise these as coverage grows, never lower them.
      // Phase 3 of ROADMAP.md targets 70%.
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
    },
    include: ['**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
