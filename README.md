# TS Electron Tools 项目搭建过程

## 概述

这是一个完整的 TypeScript + Electron + React + webpack 项目搭建示例。项目特征：
- ✅ **全局使用 ts/tsx 格式** - 所有源码文件使用 TypeScript
- ✅ **ES6 语法** - 现代 JavaScript/TypeScript 语法支持
- ✅ **Electron 集成** - 主进程和渲染进程分层架构
- ✅ **Webpack 配置** - 多环境构建支持（开发/生产）
- ✅ **热更新** - 开发环境支持热重载

## 项目结构

```
ts-electron-tools/
├── build/                      # 构建配置目录
│   ├── .out/                  # 编译后的配置输出目录
│   ├── base.config.ts         # 基础配置（ES6路径别名）
│   ├── main.config.ts         # 主进程配置
│   ├── renderer.config.ts     # 渲染进程配置
│   ├── webpack.config.ts      # 主配置文件
│   ├── dev.ts                 # 开发环境脚本（ES6接口调用webpack）
│   └── tsconfig-webpack.json  # webpack配置专用编译器选项
├── main/                      # Electron主进程源码
│   └── main.ts                # 主进程入口
├── public/                    # 静态资源目录
│   └── index.html             # HTML模板
├── src/                       # React应用源码
│   └── index.tsx              # React应用入口
├── dist/                      # 构建输出目录
│   ├── main.js                # 编译后的主进程
│   ├── bundle.js              # 编译后的React应用
│   └── index.html             # 编译后的HTML文件
├── tsconfig.json              # TypeScript项目配置（包含路径别名）
├── package.json               # 项目依赖和脚本配置
└── README.md                  # 项目文档
```

## 搭建步骤

### 1. 初始化项目

```bash
# 创建项目目录
mkdir ts-electron-tools
cd ts-electron-tools

# 初始化npm项目
npm init -y
```

### 2. 安装依赖

```bash
# 核心依赖
npm install --save-dev typescript
npm install --save-dev webpack webpack-cli
npm install --save-dev ts-loader
npm install --save-dev webpack-dev-server
npm install --save-dev html-webpack-plugin
npm install --save-dev css-loader style-loader sass-loader
npm install --save-dev concurrently wait-on
npm install --save-dev cross-env

# Electron相关
npm install --save-dev electron @types/electron

# React相关
npm install react react-dom
npm install --save-dev @types/react @types/react-dom

# webpack编译相关的Node类型
npm install --save-dev @types/webpack @types/node
```

### 3. 配置 TypeScript

#### 主 TypeScript 配置 (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "~/src/*": ["src/*"],
      "main/*": ["main/*"],
      "build/*": ["build/*"],
      "public/*": ["public/*"]
    }
  },
  "include": [
    "src/**/*",
    "main/**/*",
    "build/**/*"
  ],
  "exclude": ["node_modules"]
}
```

#### webpack配置专用 TypeScript 配置 (`build/tsconfig-webpack.json`)
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "outDir": "./.out",
    "strict": false
  },
  "include": [
    "./webpack.config.ts",
    "./base.config.ts",
    "./main.config.ts",
    "./renderer.config.ts",
    "./dev.ts"
  ]
}
```

### 4. 配置 Webpack

#### 基础配置 (`build/base.config.ts`)
```typescript
import path from 'path';

export const createBaseConfig = () => ({
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, '..', '..', 'src'),
      '~/src': path.resolve(__dirname, '..', '..', 'src'),
      'main': path.resolve(__dirname, '..', '..', 'main'),
      'build': path.resolve(__dirname, '..', '..', 'build'),
      'public': path.resolve(__dirname, '..', '..', 'public'),
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
    path: path.resolve(__dirname, '..', '..', 'dist'),
  },
});

export default createBaseConfig;
```

#### 主进程配置 (`build/main.config.ts`)
```typescript
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
```

#### 渲染进程配置 (`build/renderer.config.ts`)
```typescript
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
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
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
  ],
  devServer: {
    compress: true,
    port: 3000,
    historyApiFallback: true,
    hot: true,
    open: true,
  },
};

export default renderer;
```

### 5. 创建源码文件

#### React应用入口 (`src/index.tsx`)
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
  return (
    <div>
      <h1>欢迎使用 TS Electron Tools - 更新时间: {new Date().toLocaleTimeString()}</h1>
      <p>如果时间更新，表示热替换工作正常！</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
```

#### Electron主进程 (`main/main.ts`)
```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: Electron.BrowserWindow;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    show: false,
  });

  // 环境检测和内容加载
  const isDev = process.env.NODE_ENV === 'development';
  console.log('🔧 环境检测:', { NODE_ENV: process.env.NODE_ENV, isDev });

  if (isDev) {
    console.log('🎯 开发模式：连接webpack-dev-server');
    mainWindow.loadURL('http://localhost:3000');
  } else {
    console.log('📁 生产模式：加载本地静态文件');
    const indexPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // 显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

#### HTML模板 (`public/index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TS Electron Tools</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### 6. 配置开发环境管理脚本 (`build/dev.ts`)

```typescript
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
      if (response.ok) return;
    } catch (error) {
      // 服务器还未启动
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}

async function runDev(): Promise<void> {
  console.log('🚀 启动开发环境...');

  try {
    // 1. 编译主进程
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

    // 2. 创建渲染进程编译器
    const rendererCompiler = webpack(renderer);
    if (!rendererCompiler) {
      throw new Error('无法创建渲染进程编译器');
    }

    // 3. 启动开发服务器
    const devServerOptions = {
      compress: true,
      port: 3000,
      historyApiFallback: true,
      hot: true,
      open: true,
    };

    console.log('🌐 启动webpack开发服务器...');
    const server = new WebpackDevServer(devServerOptions, rendererCompiler);

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

    // 优雅关闭处理
    const cleanup = async () => {
      console.log('\n🛑 正在关闭开发环境...');
      await server.stop();
      electronProcess.kill();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    electronProcess.on('close', (code) => {
      console.log(`Electron进程已退出，退出码: ${code}`);
      cleanup();
    });

  } catch (error) {
    console.error('❌ 开发环境启动失败:', error);
    process.exit(1);
  }
}

runDev().catch((error) => {
  console.error('❌ 开发环境启动失败:', error);
  process.exit(1);
});
```

### 7. 配置 npm 脚本

```json
{
  "scripts": {
    "start": "electron dist/main.js",
    "prebuild": "tsc --project build/tsconfig-webpack.json",
    "build": "webpack --config build/.out/webpack.config.js --mode production",
    "predev": "tsc --project build/tsconfig-webpack.json",
    "dev-run": "cross-env NODE_ENV=development tsc --project build/tsconfig-webpack.json && cross-env NODE_ENV=development node build/.out/dev.js",
    "electron": "npm run build && electron dist/main.js"
  }
}
```

## 使用方法

### 开发模式
```bash
# 启动开发环境（webpack-dev-server + Electron）
npm run dev-run
```

### 生产构建
```bash
# 生产构建
npm run build

# 运行生产版本
npm run electron
```

## 项目特色

1. **TypeScript深度集成**
   - 所有配置文件使用TypeScript + ES6语法
   - 源码文件使用.ts/.tsx格式

2. **模块化配置架构**
   - webpack配置按功能拆分（base/main/renderer）
   - 共享配置减少重复代码

3. **开发环境优化**
   - ES6 API直接调用webpack（非命令行）
   - 热更新支持React应用和Electron窗口
   - 智能进程生命周期管理

4. **路径别名系统**
   - TypeScript和webpack共同支持路径别名
   - 简化模块导入路径

5. **跨平台兼容**
   - Windows/Linux/MacOS环境兼容
   - 环境变量处理（NODE_ENV检测）

## 技术栈

- **前端**: React 19 + TypeScript
- **构建**: webpack 5 + webpack-dev-server
- **桌面**: Electron 22
- **样式**: CSS/Sass (可选)
- **开发**: 热重载 + 路径别名

## 注意事项

1. 确保Node.js版本 >= 18
2. 首次运行前需要安装所有依赖：`npm install`
3. 开发模式会在端口3000启动webpack-dev-server
4. Electron应用会自动连接到开发服务器（热更新）
5. 生产构建输出到`dist/`目录

## 构建流程

```
源码 (TypeScript + ES6)
        ↓
webpack编译配置 + TypeScript编译
        ↓
ES6 → CommonJS (构建配置)
        ↓
webpack执行构建 (主进程 + 渲染进程)
        ↓
打包输出 (dist/)
        ↓
Electron应用可执行
```

这个搭建过程提供了完整的现代前端桌面应用开发体验，结合了TypeScript的类型安全、ES6的现代语法，并通过精心设计的构建流程实现了高效的开发和生产环境管理。
