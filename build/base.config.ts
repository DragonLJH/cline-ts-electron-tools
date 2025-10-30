import path from 'path';

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
});

export default createBaseConfig;
