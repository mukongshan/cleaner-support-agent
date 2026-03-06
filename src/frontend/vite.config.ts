
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      // 仅保留实际被业务代码使用到的包的版本别名
      'sonner@2.0.3': 'sonner',
      'lucide-react@0.487.0': 'lucide-react',
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
      '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 开发模式：预构建所有重型依赖，避免浏览器发起数百个独立模块请求
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'motion/react',
      'react-markdown',
      'remark-gfm',
      'sonner',
      'lucide-react',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-switch',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
    ],
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    // 生产构建：按职责拆分 chunk，避免单包过大
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
          // 动画库（较大，单独拆出）
          'vendor-motion': ['motion/react'],
          // Markdown 渲染（仅 Chat 页用到）
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
          // UI 基础组件
          'vendor-ui': [
            'sonner',
            'lucide-react',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-switch',
            '@radix-ui/react-slot',
            '@radix-ui/react-dialog',
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
