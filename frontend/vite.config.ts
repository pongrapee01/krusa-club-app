import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  return {
    resolve: { tsconfigPaths: true },
    plugins: [react(), tailwindcss()],
    // Proxy ใช้เฉพาะ dev เท่านั้น
    // Production ใช้ VITE_API_BASE_URL จริงผ่าน apiClient โดยตรง
    server: isDev
      ? {
          proxy: {
            '/api': {
              target: env.VITE_API_BASE_URL || 'https://localhost:44392',
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  }
})

