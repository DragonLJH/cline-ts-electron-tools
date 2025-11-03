import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';

// 系统识别
const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

let mainWindow: Electron.BrowserWindow; // Home窗口（主窗口）
let childWindows: Electron.BrowserWindow[] = []; // 子窗口数组
let windowCounter: number = 0; // 窗口计数器

function createHomeWindow(): void {
  // 创建主窗口（Home窗口，父窗口）
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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

  // 加载应用首页 - 开发环境用开发服务器，生产环境用本地文件
  const isDev = process.env.NODE_ENV === 'development';
  console.log('🔧 环境检测:', { NODE_ENV: process.env.NODE_ENV, isDev });

  if (isDev) {
    console.log('🏠 开发模式：加载Home（主窗口）');
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../../dist/index.html')}`);
  }

  // 当窗口准备好显示时显示它
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Home（主窗口）已显示');

    // 开发环境下打开控制台
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 主窗口关闭事件
  mainWindow.on('closed', () => {
    console.log('❌ Home（主窗口）已关闭');
    mainWindow = null as any;
    // 当主页关闭时，关闭所有子窗口
    childWindows.forEach((childWin) => {
      if (!childWin.isDestroyed()) {
        childWin.close();
      }
    });
    childWindows = []; // 清空数组
  });
}

function createChildWindow(initialRoute: string = '/'): Electron.BrowserWindow {
  windowCounter++;
  const windowId = windowCounter;

  // 创建子窗口
  const childWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow, // 设置父窗口
    modal: false, // 非模态窗口，用户可以操作父窗口
    show: false,
    frame: !isWindows,
    titleBarStyle: isWindows ? 'hidden' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, '../dist/preload.js'),
    },
  });

  // 设置窗口ID（用于标识不同窗口）
  (childWindow as any).windowId = windowId;
  childWindows.push(childWindow);

  // 加载应用内容，包含初始路由
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log(`🪟 开发模式：加载子窗口 ${windowId} 路由: ${initialRoute}`);
    // 将路由信息作为query参数传递
    const url = initialRoute === '/' ? 'http://localhost:3000' : `http://localhost:3000?initialRoute=${encodeURIComponent(initialRoute)}`;
    childWindow.loadURL(url);
  } else {
    childWindow.loadURL(`file://${path.join(__dirname, '../../dist/index.html')}${initialRoute ? `?initialRoute=${encodeURIComponent(initialRoute)}` : ''}`);
  }

  childWindow.once('ready-to-show', () => {
    childWindow.show();
    console.log(`✅ 子窗口 ${windowId} 已显示 (路由: ${initialRoute})`);

    // 开发环境下打开控制台
    if (isDev) {
      childWindow.webContents.openDevTools();
    }
  });

  childWindow.on('closed', () => {
    console.log(`❌ 子窗口 ${windowId} 已关闭`);
    // 从数组中移除窗口
    const index = childWindows.indexOf(childWindow);
    if (index > -1) {
      childWindows.splice(index, 1);
    }
  });

  return childWindow;
}

// 设置IPC通信，允许React应用打开多个子窗口
ipcMain.handle('open-child-window', async (event, initialRoute: string = '/') => {
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
  if (childWindows.length > 0) {
    const lastWindow = childWindows[childWindows.length - 1];
    if (!lastWindow.isDestroyed()) {
      const windowId = (lastWindow as any).windowId;
      lastWindow.close();
      return { success: true, message: `Child window ${windowId} closed` };
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

// 状态管理
ipcMain.on('state-update', (event, state) => {
  // 广播状态更新到所有窗口，除了发送者
  const allWindows = [mainWindow, ...childWindows].filter(win => win && !win.isDestroyed());
  allWindows.forEach(win => {
    if (win.webContents !== event.sender) {
      win.webContents.send('state-update-broadcast', state);
    }
  });
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
  if (mainWindow === null) {
    createHomeWindow();
  }
});
