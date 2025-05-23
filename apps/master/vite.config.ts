import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/master',
  server: {
    port: 3000,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
  build: {
    outDir: '../../dist/apps/master',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      'commons/shared': '../../libs/commons/src/shared/index.ts',
      'commons/client': '../../libs/commons/src/client/index.ts',
      'commons/server': '../../libs/commons/src/server/index.ts',
    },
  },
  plugins: [
    reactRouter(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    tsconfigPaths({ root: '../../' }),
  ],
}));
