// Electron API 类型声明
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

  // API代理
  proxyRequest: (params: {
    service: string;
    config: {
      method?: string;
      url: string;
      headers?: Record<string, string>;
      body?: string;
      searchParams?: Record<string, string>;
      timeout?: number;
    };
    pathRewrite?: Record<string, string>;
  }) => Promise<{ success: boolean; data?: any; error?: string; details?: any }>;
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
