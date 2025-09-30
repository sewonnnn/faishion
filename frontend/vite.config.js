import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname을 대체할 변수 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080', // 백엔드 주소
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    // SCSS/Bootstrap 경로 해석을 위한 alias 추가
    resolve: {
        alias: {
            // @ 기호가 src 폴더를 가리키도록 설정합니다.
            '@': path.resolve(__dirname, 'src'),
            // Bootstrap 모듈 경로를 명시적으로 알려줍니다.
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        },
    },
    // 경고 비활성화 추가
    css: {
        preprocessorOptions: {
            scss: {
                // node_modules에서 발생하는 Sass Deprecation Warning을 숨김 (Bootstrap에서 발생)
                quietDeps: true,
            },
        },
    },
})
