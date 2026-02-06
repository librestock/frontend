import path from 'node:path'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const shimPath = path.resolve(
  __dirname,
  'src/lib/use-sync-external-store-shim.ts',
)
const withSelectorShimPath = path.resolve(
  __dirname,
  'src/lib/use-sync-external-store-with-selector-shim.ts',
)

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // React 19 has useSyncExternalStore built-in, use minimal shims
      'use-sync-external-store/shim/with-selector.js': withSelectorShimPath,
      'use-sync-external-store/shim/with-selector': withSelectorShimPath,
      'use-sync-external-store/shim/index.js': shimPath,
      'use-sync-external-store/shim': shimPath,
      'use-sync-external-store': shimPath,
    },
  },
  ssr: {
    noExternal: ['next-themes'],
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
  ],
})
