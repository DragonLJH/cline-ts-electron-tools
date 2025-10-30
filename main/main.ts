import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: Electron.BrowserWindow;

function createWindow(): void {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    show: false, // 先不显示窗口，直到内容加载完毕
  });

  // 当窗口准备好显示时显示它
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 加载应用首页 - 开发环境用开发服务器，生产环境用本地文件
  const isDev = process.env.NODE_ENV === 'development';
  console.log('🔧 环境检测:', { NODE_ENV: process.env.NODE_ENV, isDev });

  if (isDev) {
    console.log('🎯 开发模式：连接webpack-dev-server');
    mainWindow.loadURL('http://localhost:3000')
  } else {
    mainWindow.loadURL(`file://${path.join(
      __dirname,
      "../../dist/index.html"
    )}`)
  }



  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
}

// Electron 会在初始化完成并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow);

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
    createWindow();
  }
});
