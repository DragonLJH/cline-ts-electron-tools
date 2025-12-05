import path from 'path';
import { config } from 'dotenv';
import webpack from 'webpack';

// 加载环境变量
config({ path: path.resolve(__dirname, '../../.env') });

// 创建环境变量定义
const createEnvDefinitions = () => {
  const definitions: Record<string, any> = {};

  return definitions;
};

export const createBaseConfig = () => ({
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, '../../src'),
      '~/src': path.resolve(__dirname, '../../src'),
      'main': path.resolve(__dirname, '../../main'),
      'build': path.resolve(__dirname, '../../build'),
      'public': path.resolve(__dirname, '../../public'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../../dist'),
  },
  plugins: [
    // 定义环境变量
    new webpack.DefinePlugin(createEnvDefinitions()),
  ],
});

export default createBaseConfig;
