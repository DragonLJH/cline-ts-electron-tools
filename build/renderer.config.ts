import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { Configuration } from 'webpack';
import { createBaseConfig } from './base.config';

const renderer: Configuration & { devServer?: any } = {
  ...createBaseConfig(),
  mode: 'development',
  entry: './src/index.tsx',
  target: 'web',
  output: {
    ...createBaseConfig().output,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      ...createBaseConfig().module.rules,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    // 复制public目录下的静态资源
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../../public'),
          to: path.resolve(__dirname, '../../dist'),
          globOptions: {
            ignore: ['**/index.html'], // 排除index.html，因为HtmlWebpackPlugin会处理
          },
        },
      ],
    }),
  ],
  devServer: {
    compress: true,
    port: 3000,
    historyApiFallback: true, // 支持SPA路由
    open: false, // 不自动打开浏览器
  },
};

export default renderer;
