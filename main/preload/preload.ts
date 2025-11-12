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

  // 文件对话框
  showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
  validateFilePath: (filePath: string) => Promise<{
    exists: boolean;
    isDirectory?: boolean;
    isFile?: boolean;
    size?: number;
    modifiedTime?: string;
    error?: string;
  }>;
  readImageFile: (filePath: string) => Promise<{
    success: boolean;
    data?: string; // base64 data URL
    error?: string;
  }>;

  // 状态管理
  sendStateUpdate: (state: any) => void;
  getInitialState: () => Promise<any>;
  sendLanguageUpdate: (state: any) => void;
  getInitialLanguageState: () => Promise<any>;

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

  // 文件对话框API
  showOpenDialog: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('show-open-dialog', options),
  validateFilePath: (filePath: string) => ipcRenderer.invoke('validate-file-path', filePath),
  readImageFile: (filePath: string) => ipcRenderer.invoke('read-image-file', filePath),

  // 状态管理
  sendStateUpdate: (state: any) => ipcRenderer.send('state-update', state),
  getInitialState: () => ipcRenderer.invoke('get-initial-state'),
  sendLanguageUpdate: (state: any) => ipcRenderer.send('language-update', state),
  getInitialLanguageState: () => ipcRenderer.invoke('get-initial-language-state'),


};

// 监听状态更新并广播到renderer
ipcRenderer.on('state-update-broadcast', (event, state) => {
  window.postMessage({ type: 'ELECTRON_STATE_UPDATE', state }, '*');
});

ipcRenderer.on('language-update-broadcast', (event, state) => {
  window.postMessage({ type: 'ELECTRON_LANGUAGE_UPDATE', state }, '*');
});

ipcRenderer.on('state-init', (event, state) => {
  window.postMessage({ type: 'ELECTRON_STATE_INIT', state }, '*');
});

ipcRenderer.on('language-init', (event, state) => {
  window.postMessage({ type: 'ELECTRON_LANGUAGE_INIT', state }, '*');
});

ipcRenderer.on('force-set-state', (event, state) => {
  window.postMessage({ type: 'ELECTRON_FORCE_SET_STATE', state }, '*');
});

ipcRenderer.on("initialize-state", (event, state) => {
  window.postMessage({ type: 'ELECTRON_INIT_STATE', state }, '*');
})


// 安全地将API暴露给渲染进程
try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('✅ Preload script loaded successfully');
} catch (error) {
  console.error('❌ Failed to expose APIs:', error);
}

(window as any).initialRoute = '/';

// 防止渲染进程直接访问electron模块
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Preload script is running in development mode');

  // 在开发模式下，暴露一些额外的调试信息
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}
