import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression2'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Legacy browser support for older browsers
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    // Bundle analyzer - generates stats.html
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
    // Brotli compression for modern browsers
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Gzip compression fallback
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],


  server: {
    // Allow ngrok/public hosts to access the Vite dev server during demos.
    // Use `true` to allow all hosts (typed-safe). For safety, replace with an array of exact hostnames, e.g.:
    // allowedHosts: ['737162775447.ngrok-free.app']
      port: 5173, // explicitly set dev server port
      hmr: {
        host: 'localhost', // make sure HMR connects to the right host
        port: 5173,        // explicitly match server port
  },
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy Socket.io connections to the backend
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
      },
    },
  },


  build: {
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Minify with esbuild (faster builds)
    minify: 'esbuild',
    // Enable source maps for production debugging
    sourcemap: true,
    // Target modern browsers
    target: 'es2020',
    // Rollup options for optimized chunking
    rollupOptions: {
      output: {
        // Manual chunks for better caching and parallel loading
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI components and visualization
          'ui-vendor': ['lucide-react', 'recharts'],
          // Data fetching and state management
          'data-vendor': ['@tanstack/react-query'],
        },
        // Asset naming for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {

            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },

      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },

  // Optimize dependencies pre-bundling for faster dev server
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'recharts',
      '@tanstack/react-query',
    ],
    // Exclude heavy native dependencies
    exclude: ['bcrypt', 'mysql2'],
  },

  // ESBuild optimizations
  esbuild: {
    // Drop console and debugger in production
    drop: ['console', 'debugger'],
    // Enable tree shaking
    treeShaking: true,
  },

})
