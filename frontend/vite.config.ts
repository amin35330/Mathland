import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
          manifest: {
            name: 'قهرمان ریاضی - MathHero', // نامی که زیر آیکون دسکتاپ دیده می‌شود
            short_name: 'MathHero',          // نامی که در موبایل دیده می‌شود
            description: 'دستیار هوشمند حل مسائل ریاضی و آموزش آنلاین | قهرمان ریاضی',
            theme_color: '#8b5cf6',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            orientation: 'portrait',
            icons: [
              {
                src: '/pwa-192x192.png', // دقت کنید اسلش اول بسیار مهم است
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      define: {
        'process.env': env
      }
    };
});