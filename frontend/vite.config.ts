import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    // اصلاح مسیر خواندن env
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      plugins: [react()],
      resolve: {
        alias: {
          // اصلاح مهم: @ باید به پوشه src اشاره کند
          '@': path.resolve(__dirname, './src'),
        },
      },
      // تعریف متغیرها برای استفاده در فرانت (اختیاری ولی مفید)
      define: {
        'process.env': env
      }
    };
});