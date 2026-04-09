import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 配置支持路径别名
export default defineConfig({
    plugins: [vue()],

    // 路径别名配置
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    // 代理配置
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:9200', // 👉 后端地址
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})