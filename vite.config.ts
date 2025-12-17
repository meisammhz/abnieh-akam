// FIX: Import `cwd` from `node:process` to provide proper types for the function
// without relying on global Node types which were causing compilation errors.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Vite replaces `process.env.API_KEY` with the value of `env.API_KEY` during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
  }
})
