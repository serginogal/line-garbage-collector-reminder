import { defineConfig } from 'tsup';
import tsconfigPaths from 'esbuild-plugin-tsconfig-paths';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true,
  external: ['better-sqlite3'],
  esbuildPlugins: [tsconfigPaths.tsconfigPathsPlugin()],
});
