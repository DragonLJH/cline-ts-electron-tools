import path from 'path';
import { config } from 'dotenv';
import webpack from 'webpack';

// 加载环境变量
config({ path: path.resolve(__dirname, '../../.env') });

// 创建环境变量定义
const createEnvDefinitions = () => {
  const definitions: Record<string, any> = {};

  // ===== 生产环境域名配置 =====
  definitions['process.env.PROD_API_DOMAIN'] = JSON.stringify(process.env.PROD_API_DOMAIN);
  definitions['process.env.PROD_BPMN_DOMAIN'] = JSON.stringify(process.env.PROD_BPMN_DOMAIN);
  definitions['process.env.PROD_AUTH_DOMAIN'] = JSON.stringify(process.env.PROD_AUTH_DOMAIN);
  definitions['process.env.PROD_FILE_DOMAIN'] = JSON.stringify(process.env.PROD_FILE_DOMAIN);

  // ===== 开发环境代理目标配置 =====
  definitions['process.env.API_PROXY_TARGET'] = JSON.stringify(process.env.API_PROXY_TARGET);
  definitions['process.env.BPMN_API_TARGET'] = JSON.stringify(process.env.BPMN_API_TARGET);
  definitions['process.env.AUTH_API_TARGET'] = JSON.stringify(process.env.AUTH_API_TARGET);
  definitions['process.env.FILE_API_TARGET'] = JSON.stringify(process.env.FILE_API_TARGET);

  // ===== 主进程代理目标配置 =====
  definitions['process.env.MAIN_API_TARGET'] = JSON.stringify(process.env.MAIN_API_TARGET);
  definitions['process.env.MAIN_BPMN_TARGET'] = JSON.stringify(process.env.MAIN_BPMN_TARGET);
  definitions['process.env.MAIN_AUTH_TARGET'] = JSON.stringify(process.env.MAIN_AUTH_TARGET);
  definitions['process.env.MAIN_FILE_TARGET'] = JSON.stringify(process.env.MAIN_FILE_TARGET);

  // ===== BPMN配置服务URL =====
  definitions['process.env.BPMN_CONFIG_URL'] = JSON.stringify(process.env.BPMN_CONFIG_URL);
  definitions['process.env.VITE_BPMN_CONFIG_URL'] = JSON.stringify(process.env.VITE_BPMN_CONFIG_URL);

  // ===== 代理路由路径配置 =====
  definitions['process.env.PROXY_API_PATH'] = JSON.stringify(process.env.PROXY_API_PATH);
  definitions['process.env.PROXY_BPMN_PATH'] = JSON.stringify(process.env.PROXY_BPMN_PATH);
  definitions['process.env.PROXY_AUTH_PATH'] = JSON.stringify(process.env.PROXY_AUTH_PATH);
  definitions['process.env.PROXY_FILE_PATH'] = JSON.stringify(process.env.PROXY_FILE_PATH);

  // ===== SSL和安全配置 =====
  definitions['process.env.VERIFY_SSL'] = JSON.stringify(process.env.VERIFY_SSL);
  definitions['process.env.PROXY_TIMEOUT'] = JSON.stringify(process.env.PROXY_TIMEOUT);

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
