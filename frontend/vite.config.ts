import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './src/common'),
      '@constants': path.resolve(__dirname, './src/common/constants'),
      '@api': path.resolve(__dirname, './src/api'),
      'react-transition-group/TransitionGroupContext': 'react-transition-group/cjs/TransitionGroupContext.js',
      'react-transition-group/Transition': 'react-transition-group/cjs/Transition.js',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    server: {
      deps: {
        inline: [/@mui\/material/, /@emotion/, /react-transition-group/],
      },
    },
  },
});
