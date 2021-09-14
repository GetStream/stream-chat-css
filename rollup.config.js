import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';
import process from 'process';

import pkg from './package.json';

process.env.NODE_ENV = 'production';

const styleBundle = {
  cache: false,
  input: 'src/styles/index.scss',
  output: [
    {
      dir: 'dist/css',
      format: 'cjs',
    },
  ],
  plugins: [
    scss({
      output: pkg.style,
      outputStyle: 'compressed',
      prefix: `@import "./variables.scss";`,
    }),
    copy({
      targets: [
        { src: 'src/assets/*', dest: 'dist/assets' },
        { src: 'src/styles/*', dest: 'dist/scss' },
      ],
    }),
  ],
  watch: {
    chokidar: false,
    include: 'src/',
  },
};

export default () => [styleBundle];
