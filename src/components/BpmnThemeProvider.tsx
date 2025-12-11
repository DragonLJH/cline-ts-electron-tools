/**
 * BpmnThemeProvider - BPMN主题提供者组件
 * 提供BPMN样式主题的React Context支持
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  BpmnThemeConfig,
  getCurrentTheme,
  setTheme,
  addThemeChangeListener,
  removeThemeChangeListener,
  getAvailableThemes,
  createCustomTheme,
  setSystemTheme,
  watchSystemTheme,
} from '@/utils/bpmn/styles';

interface BpmnThemeContextValue {
  // 当前主题
  theme: BpmnThemeConfig;

  // 主题操作
  setTheme: (theme: string | BpmnThemeConfig) => void;
  availableThemes: string[];
  createCustomTheme: (name: string, baseTheme?: string) => BpmnThemeConfig;

  // 系统主题
  setSystemTheme: () => void;
  watchSystemTheme: () => (() => void);
}

const BpmnThemeContext = createContext<BpmnThemeContextValue | undefined>(undefined);

interface BpmnThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
  enableSystemTheme?: boolean;
}

/**
 * BPMN主题提供者组件
 */
export const BpmnThemeProvider: React.FC<BpmnThemeProviderProps> = ({
  children,
  initialTheme = 'light',
  enableSystemTheme = true,
}) => {
  const [theme, setThemeState] = useState<BpmnThemeConfig>(getCurrentTheme());

  // 主题变更处理函数
  const handleThemeChange = (newTheme: BpmnThemeConfig) => {
    setThemeState(newTheme);

    // 更新CSS变量
    if (newTheme.cssVariables) {
      const root = document.documentElement;
      Object.entries(newTheme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    // 更新body类名用于主题切换
    const body = document.body;
    const themeClasses = ['light', 'dark', 'highContrast', 'blue', 'green', 'purple'];

    // 移除所有主题类
    themeClasses.forEach(cls => body.classList.remove(cls));

    // 添加当前主题类（转换为小写）
    const themeClass = newTheme.name.toLowerCase();
    if (themeClasses.includes(themeClass)) {
      body.classList.add(themeClass);
    }
  };

  // 初始化主题
  useEffect(() => {
    // 设置初始主题
    setTheme(initialTheme);

    // 监听主题变更
    const unsubscribe = addThemeChangeListener(handleThemeChange);

    // 如果启用系统主题，设置系统主题并监听变更
    let unwatchSystemTheme: (() => void) | undefined;
    if (enableSystemTheme) {
      setSystemTheme();
      unwatchSystemTheme = watchSystemTheme();
    }

    // 应用初始主题
    handleThemeChange(getCurrentTheme());

    return () => {
      unsubscribe();
      if (unwatchSystemTheme) {
        unwatchSystemTheme();
      }
    };
  }, [initialTheme, enableSystemTheme]);

  // 主题设置函数
  const handleSetTheme = (themeName: string | BpmnThemeConfig) => {
    setTheme(themeName);
  };

  // 创建自定义主题
  const handleCreateCustomTheme = (name: string, baseTheme = 'light') => {
    return createCustomTheme(name, baseTheme);
  };

  const contextValue: BpmnThemeContextValue = {
    theme,
    setTheme: handleSetTheme,
    availableThemes: getAvailableThemes(),
    createCustomTheme: handleCreateCustomTheme,
    setSystemTheme,
    watchSystemTheme,
  };

  return (
    <BpmnThemeContext.Provider value={contextValue}>
      {children}
    </BpmnThemeContext.Provider>
  );
};

/**
 * 使用BPMN主题的Hook
 */
export const useBpmnTheme = (): BpmnThemeContextValue => {
  const context = useContext(BpmnThemeContext);
  if (!context) {
    throw new Error('useBpmnTheme must be used within a BpmnThemeProvider');
  }
  return context;
};

/**
 * 主题切换器组件
 */
export const BpmnThemeSwitcher: React.FC = () => {
  const { theme, setTheme, availableThemes } = useBpmnTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value);
  };

  return (
    <div className="bpmn-theme-switcher">
      <label htmlFor="theme-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        BPMN 主题:
      </label>
      <select
        id="theme-select"
        value={theme.name}
        onChange={handleThemeChange}
        className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        {availableThemes.map(themeName => (
          <option key={themeName} value={themeName}>
            {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * 主题调试面板组件（开发时使用）
 */
export const BpmnThemeDebugPanel: React.FC = () => {
  const { theme } = useBpmnTheme();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
        BPMN Theme Debug
      </h3>
      <div className="space-y-1 text-xs">
        <div><strong>Current:</strong> {theme.name}</div>
        <div><strong>Colors:</strong> {Object.keys(theme.colors).length} defined</div>
        {theme.cssVariables && (
          <div><strong>CSS Vars:</strong> {Object.keys(theme.cssVariables).length} set</div>
        )}
      </div>
      <details className="mt-2">
        <summary className="text-xs cursor-pointer text-blue-600 dark:text-blue-400">
          Show Colors
        </summary>
        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
          {Object.entries(theme.colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: value }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {key}: {value}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default BpmnThemeProvider;
