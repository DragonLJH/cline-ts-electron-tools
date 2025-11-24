import { ipcMain, BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import { app } from 'electron';
import { WindowManager } from './window-manager';
import fs from 'fs';
import path from 'path';
import axios, { AxiosRequestConfig } from 'axios';
import { proxyApiRequest, ProxyServiceType, getProxyManager, ProxyRequestConfig } from '../src/utils/proxy-manager';

// 窗口管理实例
let windowManager: WindowManager;
let globalAppState: any;
let globalLanguageState: any;

/**
 * 初始化IPC处理器
 */
export function initializeIPC(windowManagerInstance: WindowManager, appState: any, langState: any) {
  // 使用传入的窗口管理器实例
  windowManager = windowManagerInstance;

  // 保存状态引用
  globalAppState = appState;
  globalLanguageState = langState;

  // 注册所有IPC处理器
  setupWindowIPC();
  setupFileIPC();
  setupStateIPC();
}

// 窗口管理相关IPC处理器
function setupWindowIPC() {
  // 设置IPC通信，允许React应用打开多个子窗口
  ipcMain.handle('open-child-window', async (event, initialRoute: string = '/') => {
    log.info('🆔 IPC收到打开子窗口请求', { initialRoute, globalAppState, globalLanguageState });
    try {
      const newWindow = windowManager.createChildWindow(initialRoute);
      return {
        success: true,
        message: `Child window opened with route: ${initialRoute}`,
        windowId: 'auto-generated'
      };
    } catch (error) {
      return { success: false, message: `Failed to open child window: ${error instanceof Error ? error.message : String(error)}` };
    }
  });

  ipcMain.handle('close-child-window', async (event) => {
    // 关闭最后一个打开的子窗口
    const closed = windowManager.closeLastChildWindow();
    return {
      success: closed,
      message: closed ? 'Last child window closed' : 'No child windows to close'
    };
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
}

// 文件操作相关IPC处理器
function setupFileIPC() {
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
}

// 状态管理相关IPC处理器
function setupStateIPC() {
  ipcMain.on('state-update', (event, state) => {
    log.info('📡 收到状态更新:', state);
    log.info('发送者窗口ID:', event.sender.id);

    // 更新全局状态
    globalAppState = { ...globalAppState, ...state };
    log.info('📝 更新的全局状态:', globalAppState);

    // 获取发送者窗口
    const senderWin = BrowserWindow.fromWebContents(event.sender);
    if (senderWin) {
      // 广播状态更新
      windowManager.broadcastState(state, senderWin);
    }
  });



  // 获取初始状态 - 新窗口可以用此获取全局状态
  ipcMain.handle('get-initial-state', () => {
    return globalAppState;
  });

  ipcMain.handle('get-initial-language-state', () => {
    return globalLanguageState;
  });

  // 代理管理器相关IPC处理器
  setupProxyIPC();
}

// 代理管理器相关IPC处理器
function setupProxyIPC() {
  // 执行代理请求
  ipcMain.handle('proxy-request', async (event, {
    service,
    config,
    pathRewrite
  }: {
    service: ProxyServiceType;
    config: ProxyRequestConfig;
    pathRewrite?: Record<string, string>;
  }) => {
    try {
      log.info(`🔄 IPC代理请求: ${service}`, {
        method: config.method,
        url: config.url
      });

      const result = await proxyApiRequest(service, config, pathRewrite);
      return { success: true, data: result };
    } catch (error: any) {
      log.error(`❌ IPC代理请求失败: ${service}`, error);
      return {
        success: false,
        error: error.message || 'Proxy request failed',
        details: error
      };
    }
  });

  // 获取代理配置信息
  ipcMain.handle('get-proxy-config', async (event, service: ProxyServiceType) => {
    try {
      const proxyManager = getProxyManager();
      const config = proxyManager.getProxyConfig(service);
      return { success: true, config };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get proxy config'
      };
    }
  });

  // 获取所有代理配置
  ipcMain.handle('get-all-proxy-configs', async () => {
    try {
      const proxyManager = getProxyManager();
      const configs = proxyManager.getAllProxyConfigs();
      return { success: true, configs };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get proxy configs'
      };
    }
  });

  // 更新代理配置
  ipcMain.handle('update-proxy-config', async (event, {
    service,
    updates
  }: {
    service: ProxyServiceType;
    updates: any;
  }) => {
    try {
      const proxyManager = getProxyManager();
      proxyManager.updateProxyConfig(service, updates);
      return { success: true, message: 'Proxy config updated' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update proxy config'
      };
    }
  });

  // 代理健康检查
  ipcMain.handle('proxy-health-check', async () => {
    try {
      const proxyManager = getProxyManager();
      const healthStatus = await proxyManager.healthCheck();
      return { success: true, healthStatus };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Health check failed'
      };
    }
  });

  // BPMN API 专用代理请求
  ipcMain.handle('proxy-bpmn-api', async (event, config: ProxyRequestConfig) => {
    try {
      log.info(`🔄 BPMN API代理请求`, {
        method: config.method,
        url: config.url
      });

      const result = await proxyApiRequest(ProxyServiceType.BPMN, config);
      return { success: true, data: result };
    } catch (error: any) {
      log.error(`❌ BPMN API代理请求失败`, error);
      return {
        success: false,
        error: error.message || 'BPMN API proxy request failed',
        details: error
      };
    }
  });

  // 认证API专用代理请求
  ipcMain.handle('proxy-auth-api', async (event, config: ProxyRequestConfig) => {
    try {
      log.info(`🔄 认证API代理请求`, {
        method: config.method,
        url: config.url
      });
      const result = await proxyApiRequest(ProxyServiceType.AUTH, config);
      return { success: true, data: result };
    } catch (error: any) {
      log.error(`❌ 认证API代理请求失败`, error);
      return {
        success: false,
        error: error.message || 'Auth API proxy request failed',
        details: error
      };
    }
  });

  // 文件API专用代理请求
  ipcMain.handle('proxy-file-api', async (event, config: ProxyRequestConfig) => {
    try {
      log.info(`🔄 文件API代理请求`, {
        method: config.method,
        url: config.url
      });
      const result = await proxyApiRequest(ProxyServiceType.FILE, config);
      return { success: true, data: result };
    } catch (error: any) {
      log.error(`❌ 文件API代理请求失败`, error);
      return {
        success: false,
        error: error.message || 'File API proxy request failed',
        details: error
      };
    }
  });

  // 通用API代理请求
  ipcMain.handle('proxy-api', async (event, config: ProxyRequestConfig) => {
    try {
      log.info(`🔄 通用API代理请求`, {
        method: config.method,
        url: config.url
      });
      const result = await proxyApiRequest(ProxyServiceType.API, config);
      return { success: true, data: result };
    } catch (error: any) {
      log.error(`❌ 通用API代理请求失败`, error);
      return {
        success: false,
        error: error.message || 'API proxy request failed',
        details: error
      };
    }
  });
}
