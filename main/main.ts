import { app, Menu } from 'electron';
import log from 'electron-log';
import { WindowManager } from './window-manager';
import { initializeIPC } from './ipc-handlers';

// 创建窗口管理器实例
const windowManager = new WindowManager();

// 系统识别
const isWindows = process.platform === 'win32';

// Electron 会在初始化完成并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  log.info('🚀 Electron应用启动');
  log.info('🖥️ 平台信息:', process.platform, process.arch);

  if (isWindows) {
    Menu.setApplicationMenu(null);
  }

  // 初始化IPC处理器
  initializeIPC(windowManager, {}, {});

  // 创建主窗口
  windowManager.createHomeWindow();
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
  if (!windowManager.hasHomeWindow()) {
    windowManager.createHomeWindow();
  }
});
