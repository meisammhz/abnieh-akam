import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cwd } from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');
  return {
    // مقدار base باید دقیقاً نام مخزن شما در گیت‌هاب باشد
    base: '/abnieh-akam/',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false
    }
  }
})