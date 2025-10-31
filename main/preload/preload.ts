import { contextBridge, ipcRenderer } from 'electron';

// 预加载脚本，用于安全地在渲染进程中暴露主进程的API
export interface ElectronAPI {
  // 窗口管理
  openChildWindow: (initialRoute?: string) => Promise<{ success: boolean; message: string; windowId?: number }>;
  closeChildWindow: () => Promise<{ success: boolean; message: string }>;

  // 系统信息
  minimizeWindow: () => void;
  closeWindow: () => void;
  maximizeWindow: () => void;
  restoreWindow: () => void;
  isMaximized: () => Promise<boolean>;

  // 应用信息
  getAppVersion: () => Promise<string>;
  getPlatform: () => string;

  // 状态管理
  sendStateUpdate: (state: any) => void;
}

// 定义要在渲染进程中暴露的API
const electronAPI: ElectronAPI = {
  // 窗口管理API
  openChildWindow: (initialRoute?: string) => ipcRenderer.invoke('open-child-window', initialRoute || '/'),
  closeChildWindow: () => ipcRenderer.invoke('close-child-window'),

  // 窗口控制API
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  restoreWindow: () => ipcRenderer.invoke('restore-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),

  // 应用信息API
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => process.platform,

  // 状态管理
  sendStateUpdate: (state: any) => ipcRenderer.send('state-update', state),
};

// 监听状态更新并广播到renderer
ipcRenderer.on('state-update-broadcast', (event, state) => {
  window.postMessage({ type: 'ELECTRON_STATE_UPDATE', state }, '*');
});

// 安全地将API暴露给渲染进程
try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('✅ Preload script loaded successfully');
} catch (error) {
  console.error('❌ Failed to expose APIs:', error);
}

// 将路由信息存储在全局变量中，以便React应用在启动时读取
(window as any).initialRoute = '/';

// 防止渲染进程直接访问electron模块
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Preload script is running in development mode');

  // 在开发模式下，暴露一些额外的调试信息
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}
