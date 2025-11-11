#!/usr/bin/env node

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { spawn } from 'child_process';
import * as path from 'path';
import renderer from './renderer.config';

const DEV_SERVER_URL = 'http://localhost:3000';
const ELECTRON_MAIN_PATH = path.resolve(__dirname, '..', '..', 'dist', 'main.js');

// 开发服务器配置变量
let actualDevConfig = {
  host: 'localhost',
  port: 3000,
  url: DEV_SERVER_URL
};

async function waitForServer(url: string, timeout: number = 30000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // 使用localhost而不是IPv6格式进行检查
      const localhostUrl = url.replace(/http:\/\/\[::1\]('|http:\/\/::1')/, 'http://localhost');
      const response = await fetch(localhostUrl);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}

async function runDev(): Promise<void> {
  console.log('🚀 启动开发环境...');

  try {
    // 1. 先独立编译主进程和preload脚本
    console.log('📦 编译主进程...');
    const mainConfig = await import('./main.config');

    await new Promise<void>((resolve, reject) => {
      const mainCompiler = webpack(mainConfig.default);
      if (!mainCompiler) {
        reject(new Error('无法创建主进程编译器'));
        return;
      }

      mainCompiler.run((err, stats) => {
        if (err) {
          console.error('❌ 主进程编译失败:', err);
          reject(err);
          return;
        }
        console.log('✅ 主进程编译完成');
        resolve();
      });
    });

    console.log('📦 编译preload脚本...');
    const preloadConfig = await import('./preload.config');

    await new Promise<void>((resolve, reject) => {
      const preloadCompiler = webpack(preloadConfig.default);
      if (!preloadCompiler) {
        reject(new Error('无法创建preload编译器'));
        return;
      }

      preloadCompiler.run((err, stats) => {
        if (err) {
          console.error('❌ preload脚本编译失败:', err);
          reject(err);
          return;
        }
        console.log('✅ preload脚本编译完成');
        resolve();
      });
    });

    // 2. 创建渲染进程webpack编译器
    const rendererCompiler = webpack(renderer);
    if (!rendererCompiler) {
      throw new Error('无法创建渲染进程编译器');
    }

    // 3. 配置开发服务器选项 - 让webpack自动选择可用端口，使用localhost
    const devServerOptions = {
      compress: true,
      port: 'auto', // 自动选择可用端口
      historyApiFallback: true,
      hot: true,
      open: false,
      host: 'localhost', // 使用localhost，HMR会自动使用相同的host
    };

    // 创建开发服务器
    console.log('🌐 启动webpack开发服务器...');
    const server = new WebpackDevServer(devServerOptions, rendererCompiler);

    // 启动开发服务器
    await server.start();

    // 获取服务器实际分配的地址
    const address = server.server?.address();
    if (address && typeof address !== 'string') {
      // 强制使用localhost作为host，确保兼容性
      actualDevConfig = {
        host: 'localhost',  // 统一使用localhost
        port: address.port,
        url: `http://localhost:${address.port}`
      };
      console.log('🎯 实际服务器地址:', actualDevConfig);
      console.log(`🔗 访问URL: localhost:${address.port}`);
    } else {
      console.log('⚠️ 无法获取实际服务器地址，使用默认配置');
    }

    // 等待服务器启动
    try {
      await waitForServer(actualDevConfig.url);
      console.log('🎉 webpack开发服务器已启动');

      // 将实际配置设置为环境变量，供主进程使用
      process.env.host = actualDevConfig.host;
      process.env.port = actualDevConfig.port.toString();

      console.log(`📡 设置环境变量: ${JSON.stringify(actualDevConfig)}`);
    } catch (error) {
      console.error('❌ webpack开发服务器启动失败:', error);
      await server.stop();
      process.exit(1);
    }

    // 启动Electron
    console.log('⚡ 启动Electron应用...');
    console.log('🔄 传递环境变量:', {
      DEV_SERVER_HOST: actualDevConfig.host,
      DEV_SERVER_PORT: actualDevConfig.port.toString(),
      DEV_SERVER_URL: actualDevConfig.url,
    });

    const electronProcess = spawn('npx', ['electron', ELECTRON_MAIN_PATH], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        DEV_SERVER_HOST: actualDevConfig.host,
        DEV_SERVER_PORT: actualDevConfig.port.toString(),
        DEV_SERVER_URL: actualDevConfig.url,
      },
    });

    // 处理进程退出
    const cleanup = async () => {
      console.log('\n🛑 正在关闭开发环境...');
      await server.stop();
      electronProcess.kill();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // 监听子进程退出
    electronProcess.on('close', (code) => {
      console.log(`Electron进程已退出，退出码: ${code}`);
      cleanup();
    });

  } catch (error) {
    console.error('❌ 开发环境启动失败:', error);
    process.exit(1);
  }
}

// 运行开发脚本
runDev().catch((error) => {
  console.error('❌ 开发环境启动失败:', error);
  process.exit(1);
});
