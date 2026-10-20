import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // mymails: split long-lived vendor code so it stays cached across releases
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('naive-ui') || id.includes('vueuc') || id.includes('vooks') || id.includes('css-render') || id.includes('date-fns') || id.includes('seemly') || id.includes('evtd') || id.includes('treemate')) return 'vendor-naive'
          if (id.includes('@wangeditor') || id.includes('slate') || id.includes('prismjs') || id.includes('snabbdom')) return 'vendor-editor'
          if (/node_modules\/(\.pnpm\/)?(vue|@vue|vue-router|vue-i18n|@intlify|@vueuse|@unhead)/.test(id)) return 'vendor-vue'
        },
      },
    },
  },
  plugins: [
    vue(),
    wasm(),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': [
            'useMessage',
            'useNotification',
            'NButton',
            'NPopconfirm',
            'NIcon',
          ]
        }
      ]
    }),
    Components({
      resolvers: [NaiveUiResolver()]
    }),
    VitePWA({
      registerType: null,
      devOptions: {
        enabled: false
      },
      workbox: {
        disableDevLogs: true,
        globPatterns: [],
        runtimeCaching: [],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Temp Email',
        short_name: 'Temp Email',
        description: 'Temp Email - Temporary Email',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ]
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
  }
})
