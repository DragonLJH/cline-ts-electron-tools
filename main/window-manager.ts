import { BrowserWindow } from 'electron';
import log from 'electron-log';
import * as path from 'path';

// 窗口管理类
export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();
  private windowCounter: number = 0;

  // 共享状态（由IPC处理器同步）
  private globalAppState: any = {
    theme: 'light',
    count: 0,
    language: 'zh-CN'
  };

  constructor() {
    // 窗口清理
    this.setupWindowCleanup();
  }

  /**
   * 创建主窗口
   */
  createHomeWindow(): void {
    this.createWindow('home', '/', {
      width: 1200,
      height: 800,
    }, true);
  }

  /**
   * 通用窗口创建方法
   */
  private createWindow(
    windowId: string,
    route: string,
    config: { width: number; height: number },
    isMainWindow: boolean = false
  ): BrowserWindow {
    const isDev = process.env.NODE_ENV === 'development';
    const isWindows = process.platform === 'win32';

    log.info(`🔧 创建窗口 ${windowId} (路由: ${route}, 主窗口: ${isMainWindow})`);

    const windowConfig: Electron.BrowserWindowConstructorOptions = {
      ...config,
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
    };

    // 如果是子窗口，添加parent
    if (!isMainWindow) {
      const homeWindow = this.windows.get('home');
      if (homeWindow && !homeWindow.isDestroyed()) {
        windowConfig.parent = homeWindow;
        windowConfig.modal = false;
      }
    }

    const window = new BrowserWindow(windowConfig);
    this.windows.set(windowId, window);

    // 异步加载内容
    (async () => {
      const routeParam = isMainWindow ? '' : route !== '/' ? `?initialRoute=${encodeURIComponent(route)}` : '';
      const baseUrl = this.getDevServerUrl();

      if (isDev) {
        const url = `${baseUrl}${routeParam}`;
        window.loadURL(url);
      } else {
        const url = `file://${path.join(__dirname, '../../dist/index.html')}${routeParam}`;
        window.loadURL(url);
      }

      window.once('ready-to-show', () => {
        window.show();
        log.info(`✅ ${isMainWindow ? '主' : '子'}窗口 ${windowId} 已显示`);

        if (isDev) {
          window.webContents.openDevTools();
        }

        // 主窗口状态同步
        if (!isMainWindow) {
          this.syncStateToWindow(window, windowId);
        }
      });

      // 将当前状态传递给新窗口
      window.webContents.on("did-finish-load", () => {
        log.log('[did-finish-load]', this.getGlobalState())
        window.webContents.send("initialize-state", this.getGlobalState())
      });

      if (isMainWindow) {
        window.on('closed', () => {
          log.info('❌ 主窗口 已关闭');
          this.windows.delete(windowId);

          // 当主页关闭时，关闭所有子窗口
          for (const [key, win] of this.windows) {
            if (key !== 'home') {
              if (!win.isDestroyed()) {
                win.close();
              }
            }
          }
          this.windows.clear();
        });
      } else {
        window.on('closed', () => {
          log.info(`❌ 子窗口 ${windowId} 已关闭`);
          this.windows.delete(windowId);
        });
      }
    })();

    return window;
  }

  /**
   * 创建子窗口
   */
  createChildWindow(initialRoute: string = '/'): BrowserWindow {
    const windowId = `child-${Date.now()}`;
    this.windowCounter++;

    return this.createWindow(windowId, initialRoute, {
      width: 800,
      height: 600,
    }, false);
  }

  /**
   * 关闭最后一个子窗口
   */
  closeLastChildWindow(): boolean {
    const childKeys = Array.from(this.windows.keys()).filter(key => key.startsWith('child-'));
    if (childKeys.length > 0) {
      // 按数字排序找到最后一个
      const sortedKeys = childKeys.sort((a, b) => {
        const aNum = parseInt(a.replace('child-', ''));
        const bNum = parseInt(b.replace('child-', ''));
        return bNum - aNum;
      });
      const lastKey = sortedKeys[0];
      const lastWindow = this.windows.get(lastKey)!;
      if (!lastWindow.isDestroyed()) {
        lastWindow.close();
        return true;
      }
    }
    return false;
  }

  /**
   * 更新全局状态
   */
  updateGlobalState(state: Partial<typeof this.globalAppState>): void {
    this.globalAppState = { ...this.globalAppState, ...state };
  }

  /**
   * 更新全局语言状态
   */
  updateGlobalLanguageState(state: Partial<typeof this.globalAppState>): void {
    Object.assign(this.globalAppState, state);
  }

  /**
   * 获取窗口
   */
  getWindow(key: string): BrowserWindow | undefined {
    return this.windows.get(key);
  }

  /**
   * 获取所有窗口
   */
  getAllWindows(): Map<string, BrowserWindow> {
    return new Map(this.windows);
  }

  /**
   * 获取全局状态
   */
  getGlobalState(): any {
    return { ...this.globalAppState };
  }

  /**
   * 检查主窗口是否存在
   */
  hasHomeWindow(): boolean {
    return this.windows.has('home');
  }

  // 私有方法们

  private getDevServerUrl(): string {
    return `http://${process.env.host || 'localhost'}:${process.env.port || '3000'}`;
  }

  private syncStateToWindow(window: BrowserWindow, windowId: string): void {
    log.info(`🚀 同步状态到子窗口 ${windowId}`);

    window.webContents.send('force-set-state', {
      theme: this.globalAppState.theme,
      count: this.globalAppState.count,
      language: this.globalAppState.language
    });

    log.info(`✅ 子窗口 ${windowId} 状态同步完成`);
  }

  private setupWindowCleanup(): void {
    // 应用退出时的清理
    process.on('exit', () => {
      for (const win of this.windows.values()) {
        if (!win.isDestroyed()) {
          win.destroy();
        }
      }
    });
  }

  /**
   * 广播状态到所有窗口（除了发送者）
   */
  broadcastState(state: any, excludeWin: BrowserWindow): void {
    this.updateGlobalState(state);
    const allWindows = Array.from(this.windows.values()).filter(win => win && !win.isDestroyed());
    allWindows.forEach(win => {
      if (win.webContents !== excludeWin.webContents) {
        win.webContents.send('state-update-broadcast', state);
      }
    });
  }

}
