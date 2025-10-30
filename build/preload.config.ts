import path from 'path';
import { Configuration } from 'webpack';
import { createBaseConfig } from './base.config';

const preload: Configuration = {
  ...createBaseConfig(),
  mode: 'development',
  entry: './main/preload/preload.ts',
  target: 'electron-preload',
  output: {
    ...createBaseConfig().output,
    filename: 'preload.js',
  },
  externals: {
    electron: 'commonjs electron',
  },
};

export default preload;
