import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  plugins: [tsconfigPaths({ projects: ['tsconfig.json'] })],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 5000
  },
  server: {
    port: 3000,
    open: false,
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules') && !sourcePath.includes('@eclipse-glsp') && !sourcePath.includes('@axonivy');
    }
  },
  resolve: {
    alias: {
      'sprotty/lib/lib/virtualize': resolve('./src/shims/virtualize.js') // Fix commonjs sprotty lib used inside esm @axonivy/process-editor
    }
  },
  base: './'
}));
