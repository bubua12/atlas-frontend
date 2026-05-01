import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api/, '')
      },
      // MinIO 文件代理：浏览器请求 /minio/atlas/xxx → 转发到 MinIO /atlas/xxx
      '/minio': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/minio/, '')
      }
    }
  }
})
