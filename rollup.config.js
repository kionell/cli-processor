import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

export default [
  {
    plugins: [
      typescript({
        "removeComments": false,
        "declaration": true,
      }),
    ],
    input: './src/index.ts',
    output: [
      {
        file: './lib/esm/index.js',
        format: 'es',
      },
    ],
  },
  {
    plugins: [dts()],
    input: './src/index.ts',
    output: {
      file: './lib/esm/index.d.ts',
      format: 'es',
    },
  },
  {
    plugins: [
      typescript({
        "removeComments": false,
        "declaration": true,
      }),
      commonjs(),
    ],
    input: './src/index.ts',
    output: [
      {
        file: './lib/cjs/index.js',
        format: 'cjs',
      },
    ],
  },
  {
    plugins: [dts()],
    input: './src/index.ts',
    output: {
      file: './lib/cjs/index.d.ts',
      format: 'cjs',
    },
  },
]
