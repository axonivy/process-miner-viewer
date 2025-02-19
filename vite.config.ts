import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
  const config = {
    plugins: [tsconfigPaths()],
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 5000
    },
    esbuild: {
      target: 'esnext',
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true
        }
      }
    },
    server: {
      port: 3000,
      open: false,
      sourcemapIgnoreList(sourcePath, sourcemapPath) {
        return sourcePath.includes('node_modules') && !sourcePath.includes('@eclipse-glsp') && !sourcePath.includes('@axonivy');
      }
    },
    base: './'
  };
  return config;
});
