import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cwd } from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');
  return {
    // تنظیم base به './' باعث می‌شود آدرس‌ها در GitHub Pages (زیرپوشه) به درستی کار کنند
    base: '/abnieh-akam./',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // اطمینان از تولید فایل‌های مانیفست درست
      manifest: true
    }
  }
})
