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
      'react-transition-group/TransitionGroupContext': path.resolve(__dirname, './node_modules/react-transition-group/esm/TransitionGroupContext.js'),
      'react-transition-group/Transition': path.resolve(__dirname, './node_modules/react-transition-group/esm/Transition.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    alias: {
      '@common': path.resolve(__dirname, './src/common'),
      '@constants': path.resolve(__dirname, './src/common/constants'),
      '@api': path.resolve(__dirname, './src/api'),
      'react-transition-group/TransitionGroupContext': path.resolve(__dirname, './node_modules/react-transition-group/esm/TransitionGroupContext.js'),
      'react-transition-group/Transition': path.resolve(__dirname, './node_modules/react-transition-group/esm/Transition.js'),
    },
    server: {
      deps: {
        inline: [
          'react',
          'react-dom',
          '@mui/material',
          '@emotion/react',
          '@emotion/styled',
          'react-transition-group',
          '@mui/x-date-pickers',
          'react-hook-form'
        ],
      },
    },
  },
});
