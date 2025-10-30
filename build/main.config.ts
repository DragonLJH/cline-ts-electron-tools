import path from 'path';
import { Configuration } from 'webpack';
import { createBaseConfig } from './base.config';

const main: Configuration = {
  ...createBaseConfig(),
  mode: 'development',
  entry: './main/main.ts',
  target: 'electron-main',
  output: {
    ...createBaseConfig().output,
    filename: 'main.js',
  },
  externals: {
    electron: 'commonjs electron',
  },
};

export default main;
