// 窗口配置类型
interface WindowConfig {
  width: number;
  height: number;
  frame: boolean;
  titleBarStyle: 'hidden' | 'default';
  show: boolean;
  webPreferences: {
    nodeIntegration: boolean;
    contextIsolation: boolean;
    webSecurity: boolean;
    allowRunningInsecureContent: boolean;
    preload: string;
  };
  parent?: BrowserWindow;
  modal?: boolean;
}

import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';

// 系统识别
const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// 窗口存储：使用Map存储所有窗口，key为窗口ID（home为主窗口, child-1/child-2等为子窗口）
const windows = new Map<string, BrowserWindow>();
let windowCounter: number = 0; // 窗口计数器


// 获取开发服务器URL - 优先从配置文件读取，否则使用默认值
const getDevServerUrl = (): string => `http://${process.env.host || 'localhost'}:${process.env.port || '3000'}`;



// 公共窗口配置
const getBaseWindowConfig = (): Omit<WindowConfig, 'width' | 'height' | 'parent' | 'modal'> => ({
  frame: !isWindows,
  titleBarStyle: isWindows ? 'hidden' : 'default',
  show: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    preload: path.join(__dirname, '../dist/preload.js'),
  },
});

// 获取主窗口配置
const getHomeWindowConfig = (): WindowConfig => ({
  ...getBaseWindowConfig(),
  width: 1200,
  height: 800,
});

// 获取子窗口配置
const getChildWindowConfig = (parent: BrowserWindow): WindowConfig => ({
  ...getBaseWindowConfig(),
  width: 800,
  height: 600,
  parent,
  modal: false,
});



function createHomeWindow(): void {
  // 创建主窗口（Home窗口，父窗口）
  const isDev = process.env.NODE_ENV === 'development';
  console.log('🔧 环境检测:', { NODE_ENV: process.env.NODE_ENV, isDev });

  console.log('🏠 开发模式：加载Home（主窗口）');

  // 立即创建窗口
  const config = getHomeWindowConfig();
  const homeWindow = new BrowserWindow(config);
  windows.set('home', homeWindow);

  // 异步加载内容
  (async () => {
    const routeParam = ''; // 主窗口默认路由
    if (isDev) {
      const baseUrl = await getDevServerUrl();
      const url = `${baseUrl}${routeParam}`;
      homeWindow.loadURL(url);
    } else {
      const url = `file://${path.join(__dirname, '../../dist/index.html')}`;
      homeWindow.loadURL(url);
    }

    homeWindow.once('ready-to-show', () => {
      homeWindow.show();
      console.log('✅ Home 窗口 已显示');

      if (isDev) {
        homeWindow.webContents.openDevTools();
      }
    });

    homeWindow.on('closed', () => {
      console.log('❌ Home 窗口 已关闭');
      windows.delete('home');

      // 当主页关闭时，关闭所有子窗口
      for (const [key, win] of windows) {
        if (key !== 'home') {
          if (!win.isDestroyed()) {
            win.close();
          }
        }
      }
      windows.clear();
    });
  })();
}

function createChildWindow(initialRoute: string = '/'): BrowserWindow {
  windowCounter++;
  const windowId = `child-${windowCounter}`;

  console.log(`🚀 创建子窗口 ${windowId} 路由: ${initialRoute}`);

  // 立即创建窗口并返回，但异步加载内容
  const config = getChildWindowConfig(windows.get('home')!);
  const childWindow = new BrowserWindow(config);

  // 存储到Map中
  windows.set(windowId, childWindow);

  // 异步加载内容
  (async () => {
    const isDev = process.env.NODE_ENV === 'development';
    const routeParam = initialRoute !== '/' ? `?initialRoute=${encodeURIComponent(initialRoute)}` : '';

    if (isDev) {
      const baseUrl = await getDevServerUrl();
      const url = initialRoute !== '/' ? `${baseUrl}${routeParam}` : baseUrl;
      childWindow.loadURL(url);
    } else {
      const url = initialRoute !== '/' ? `file://${path.join(__dirname, '../../dist/index.html')}${routeParam}` : `file://${path.join(__dirname, '../../dist/index.html')}`;
      childWindow.loadURL(url);
    }

    // 设置窗口事件
    childWindow.once('ready-to-show', () => {
      childWindow.show();
      console.log(`✅ 子窗口 ${windowId} 已显示 (路由: ${initialRoute})`);

      if (isDev) {
        childWindow.webContents.openDevTools();
      }

      console.log(`🚀 发送主窗口状态到新子窗口 ${windowId}`);
      setTimeout(() => {
        console.log(`🚫 禁止子窗口 ${windowId} 发送状态更新`);
        childWindow.webContents.send('force-set-state', {
          theme: globalAppState.theme,
          count: globalAppState.count,
          language: globalLanguageState.language
        });
      }, 100);
    });

    childWindow.on('closed', () => {
      console.log(`❌ 子窗口 ${windowId} 已关闭`);
      windows.delete(windowId);
    });
  })();

  return childWindow;
}

// 设置IPC通信，允许React应用打开多个子窗口
ipcMain.handle('open-child-window', async (event, initialRoute: string = '/') => {
  console.log('🆔 IPC收到打开子窗口请求', { initialRoute, globalAppState, globalLanguageState });
  try {
    const newWindow = createChildWindow(initialRoute);
    return {
      success: true,
      message: `Child window ${(newWindow as any).windowId} opened with route: ${initialRoute}`,
      windowId: (newWindow as any).windowId
    };
  } catch (error) {
    return { success: false, message: `Failed to open child window: ${error instanceof Error ? error.message : String(error)}` };
  }
});

ipcMain.handle('close-child-window', async (event) => {
  // 关闭最后一个打开的子窗口（LIFO方式）
  const childKeys = Array.from(windows.keys()).filter(key => key.startsWith('child-'));
  if (childKeys.length > 0) {
    // 按数字排序找到最后一个（假设 child-1, child-2...）
    const sortedKeys = childKeys.sort((a, b) => {
      const aNum = parseInt(a.replace('child-', ''));
      const bNum = parseInt(b.replace('child-', ''));
      return bNum - aNum;
    });
    const lastKey = sortedKeys[0];
    const lastWindow = windows.get(lastKey)!;
    if (!lastWindow.isDestroyed()) {
      lastWindow.close();
      return { success: true, message: `Child window ${lastKey} closed` };
    }
  }
  return { success: false, message: 'No child windows to close' };
});

// 窗口控制相关IPC
ipcMain.handle('minimize-window', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.minimize();
    return { success: true, message: 'Window minimized' };
  }
  return { success: false, message: 'Window not found' };
});

ipcMain.handle('close-window', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
    return { success: true, message: 'Window closed' };
  }
  return { success: false, message: 'Window not found' };
});

ipcMain.handle('maximize-window', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.restore();
      return { success: true, message: 'Window restored' };
    } else {
      win.maximize();
      return { success: true, message: 'Window maximized' };
    }
  }
  return { success: false, message: 'Window not found' };
});

ipcMain.handle('restore-window', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.restore();
    return { success: true, message: 'Window restored' };
  }
  return { success: false, message: 'Window not found' };
});

ipcMain.handle('is-maximized', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    return win.isMaximized();
  }
  return false;
});

ipcMain.handle('get-app-version', async (event) => {
  return app.getVersion();
});

// 文件对话框相关IPC
ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender)!, options);
    return result;
  } catch (error) {
    return {
      canceled: true,
      filePaths: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

// 文件路径验证 - 检查文件是否存在且可访问
ipcMain.handle('validate-file-path', async (event, filePath: string) => {
  const fs = await import('fs');
  try {
    // 检查文件是否存在
    await fs.promises.access(filePath, fs.constants.F_OK);
    // 获取文件信息
    const stats = await fs.promises.stat(filePath);
    return {
      exists: true,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      size: stats.size,
      modifiedTime: stats.mtime.toISOString()
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

// 读取图片文件为base64数据URL - 用于预览
ipcMain.handle('read-image-file', async (event, filePath: string) => {
  const fs = await import('fs');
  const path = await import('path');

  try {
    // 检查文件是否存在
    await fs.promises.access(filePath, fs.constants.F_OK);

    // 验证是图片文件
    const ext = path.extname(filePath).toLowerCase();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];
    if (!imageExtensions.includes(ext)) {
      return {
        success: false,
        error: 'Not an image file'
      };
    }

    // 读取文件内容
    const fileBuffer = await fs.promises.readFile(filePath);
    const mimeType = `image/${ext.slice(1)}`;
    const base64Data = fileBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return {
      success: true,
      data: dataUrl
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

// 状态管理 - 全局状态存储
let globalAppState: any = {
  theme: 'light',
  count: 0,
  language: 'zh-CN' // 默认语言
};

// 全局语言状态存储
let globalLanguageState: any = {
  language: 'zh-CN'
};

ipcMain.on('state-update', (event, state) => {
  console.log('📡 收到状态更新:', state);
  console.log('发送者窗口ID:', event.sender.id);

  // 处理所有窗口的状态更新（全局状态同步）
  // 更新全局状态
  globalAppState = { ...globalAppState, ...state };
  console.log('📝 更新的全局状态:', globalAppState);

  // 广播状态更新到所有窗口，除了发送者
  const allWindows = Array.from(windows.values()).filter(win => win && !win.isDestroyed());
  allWindows.forEach(win => {
    if (win.webContents !== event.sender) {
      console.log(`📢 广播状态更新到窗口 ${win.id}`);
      win.webContents.send('state-update-broadcast', state);
    }
  });
});

ipcMain.on('language-update', (event, state) => {
  console.log('🌐 收到语言状态更新:', state);

  // 处理语言状态更新
  globalLanguageState = { ...globalLanguageState, ...state };
  console.log('📝 更新的全局语言状态:', globalLanguageState);

  // 广播语言状态更新到所有窗口，除了发送者
  const allWindows = Array.from(windows.values()).filter(win => win && !win.isDestroyed());
  allWindows.forEach(win => {
    if (win.webContents !== event.sender) {
      console.log(`📢 广播语言状态更新到窗口 ${win.id}`);
      win.webContents.send('language-update-broadcast', state);
    }
  });
});


// 获取初始状态 - 新窗口可以用此获取全局状态
ipcMain.handle('get-initial-state', () => {
  return globalAppState;
});

ipcMain.handle('get-initial-language-state', () => {
  return globalLanguageState;
});

// Electron 会在初始化完成并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  if (isWindows) {
    Menu.setApplicationMenu(null);
  }
  createHomeWindow();
});

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则大多数应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当单击 dock 图标并且没有其他窗口打开时，
  // 通常会在应用中重新创建一个窗口
  if (!windows.has('home')) {
    createHomeWindow();
  }
});
