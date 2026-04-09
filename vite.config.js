import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 配置支持路径别名
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
})