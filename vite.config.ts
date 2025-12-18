// FIX: Import `cwd` from `node:process` to provide proper types for the function
// without relying on global Node types which were causing compilation errors.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB
      },
      manifest: {
        name: 'سامانه مدیریت پروژه نارنجستان ۷',
        short_name: 'نارنجستان ۷',
        description: 'سامانه مدیریت پروژه نارنجستان ۷',
        theme_color: '#22c55e',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })],
    define: {
      // Vite replaces `process.env.API_KEY` with the value of `env.API_KEY` during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
  }
})
