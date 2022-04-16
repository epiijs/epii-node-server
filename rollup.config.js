import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'build',
    format: 'cjs'
  },
  plugins: [typescript({
    tsconfig: './tsconfig.json'
  })]
};
