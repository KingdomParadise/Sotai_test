/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // server: {
  //   proxy: {
  //     '': {
  //       target: 'http://localhost:8000/cpuhours/'
  //     },
  //   },
  // },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupVitest.ts',
  },
  plugins: [react(), tsconfigPaths()],
});
