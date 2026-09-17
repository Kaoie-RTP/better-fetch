import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      format: 'cjs',
      file: 'dist/index.cjs',
    },
  },
  {
    input: 'src/index.ts',
    plugins: [
      dts({
        tsconfig: './tsconfig.json',
      }),
    ],
    output: {
      dir: 'dist',
    },
  },
]);
