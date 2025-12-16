// FIX: Added a triple-slash directive to include Node.js types. This resolves the TypeScript error where 'cwd' was not found on 'process'.
/// <reference types="node" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Vite replaces `process.env.API_KEY` with the value of `env.API_KEY` during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
  }
})
