#!/usr/bin/env node

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { spawn } from 'child_process';
import * as path from 'path';
import renderer from './renderer.config';

const DEV_SERVER_URL = 'http://localhost:3000';
const ELECTRON_MAIN_PATH = path.resolve(__dirname, '..', '..', 'dist', 'main.js');

async function waitForServer(url: string, timeout: number = 30000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
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

    // 3. 配置开发服务器选项
    const devServerOptions = {
      compress: true,
      port: 3000,
      historyApiFallback: true,
      hot: true,
      open: false, // 不自动打开浏览器
    };

    // 创建开发服务器
    console.log('🌐 启动webpack开发服务器...');
    const server = new WebpackDevServer(devServerOptions, rendererCompiler);

    // 启动开发服务器
    await server.start();

    // 等待服务器启动
    try {
      await waitForServer(DEV_SERVER_URL);
      console.log('🎉 webpack开发服务器已启动');
    } catch (error) {
      console.error('❌ webpack开发服务器启动失败:', error);
      await server.stop();
      process.exit(1);
    }

    // 启动Electron
    console.log('⚡ 启动Electron应用...');
    const electronProcess = spawn('npx', ['electron', ELECTRON_MAIN_PATH], {
      stdio: 'inherit',
      shell: true,
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
