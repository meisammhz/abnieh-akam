// FIX: Import `cwd` from `node:process` to provide proper types for the function
// without relying on global Node types which were causing compilation errors.
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cwd } from 'node:process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Vite replaces `process.env.API_KEY` with the value of `env.API_KEY` during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
  }
})
