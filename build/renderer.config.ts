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
    port: 'auto', // 让webpack自动选择可用端口
    historyApiFallback: true, // 支持SPA路由
    hot: true, // 开启热重载
    open: false, // 不自动打开浏览器
    host: 'localhost', // 绑定到localhost，避免IPv6问题

    // Nginx风格反向代理配置
    proxy: [
      {
        context: [process.env.PROXY_API_PATH || '/api'],
        target: process.env.API_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        secure: process.env.VERIFY_SSL === 'true',
        timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
        pathRewrite: {
          ['^' + (process.env.PROXY_API_PATH || '/api')]: ''
        }
      },
      {
        context: [process.env.PROXY_MYAPP_PATH || '/myapp-api'],
        target: process.env.MYAPP_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        secure: process.env.VERIFY_SSL === 'true',
        timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
        pathRewrite: {
          ['^' + (process.env.PROXY_MYAPP_PATH || '/myapp-api')]: ''
        }
      },
      {
        context: [process.env.PROXY_BPMN_PATH || '/bpmn-api'],
        target: process.env.BPMN_API_TARGET || 'http://localhost:8080/bpmn/v1',
        changeOrigin: true,
        secure: process.env.VERIFY_SSL === 'true',
        timeout: parseInt(process.env.PROXY_TIMEOUT || '30000')
      },
      {
        context: [process.env.PROXY_AUTH_PATH || '/auth'],
        target: process.env.AUTH_API_TARGET || 'http://localhost:8081/auth',
        changeOrigin: true,
        secure: process.env.VERIFY_SSL === 'true',
        timeout: parseInt(process.env.PROXY_TIMEOUT || '30000')
      },
      {
        context: [process.env.PROXY_FILE_PATH || '/files'],
        target: process.env.FILE_API_TARGET || 'http://localhost:8082/files',
        changeOrigin: true,
        secure: process.env.VERIFY_SSL === 'true',
        timeout: parseInt(process.env.PROXY_TIMEOUT || '30000')
      }
    ]
  },
};

export default renderer;
