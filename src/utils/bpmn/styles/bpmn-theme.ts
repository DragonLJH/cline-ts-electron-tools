/**
 * BPMN Theme Configuration - 主题配置管理
 * 管理BPMN样式主题的配置和切换
 */

import { BpmnColorPalette, getThemeColors, lightThemeColors, darkThemeColors } from './color-palette';
import { BpmnElementStyles, getElementStyle, generateCSSVariables, ElementStyle } from './element-styles';

export interface BpmnThemeConfig {
  name: string;
  colors: BpmnColorPalette;
  elementStyles?: Partial<BpmnElementStyles>;
  cssVariables?: Record<string, string>;
}

export interface ThemeOverrides {
  colors?: Partial<BpmnColorPalette>;
  elementStyles?: Partial<BpmnElementStyles>;
}

/**
 * 预定义主题配置
 */
export const predefinedThemes: Record<string, BpmnThemeConfig> = {
  // 默认亮色主题
  light: {
    name: 'Light',
    colors: lightThemeColors,
    cssVariables: generateCSSVariables(lightThemeColors),
  },

  // 默认暗色主题
  dark: {
    name: 'Dark',
    colors: darkThemeColors,
    cssVariables: generateCSSVariables(darkThemeColors),
  },

  // 高对比度主题
  highContrast: {
    name: 'High Contrast',
    colors: {
      ...lightThemeColors,
      primary: '#0066cc',
      success: '#008000',
      warning: '#ff6600',
      error: '#cc0000',
      border: '#000000',
      text: '#000000',
      background: '#ffffff',
    },
  },

  // 蓝色主题
  blue: {
    name: 'Blue',
    colors: {
      ...lightThemeColors,
      primary: '#1e40af',
      userTask: '#1e40af',
      serviceTask: '#3730a3',
      gateway: '#7c3aed',
      connection: '#1e40af',
    },
  },

  // 绿色主题
  green: {
    name: 'Green',
    colors: {
      ...lightThemeColors,
      primary: '#059669',
      userTask: '#059669',
      serviceTask: '#0d9488',
      gateway: '#ca8a04',
      connection: '#059669',
    },
  },

  // 紫色主题
  purple: {
    name: 'Purple',
    colors: {
      ...lightThemeColors,
      primary: '#7c3aed',
      userTask: '#7c3aed',
      serviceTask: '#a855f7',
      gateway: '#f59e0b',
      connection: '#7c3aed',
    },
  },
};

/**
 * 当前活跃主题
 */
let currentTheme: BpmnThemeConfig = predefinedThemes.light;

/**
 * 主题变更监听器
 */
type ThemeChangeListener = (theme: BpmnThemeConfig) => void;
const themeChangeListeners: ThemeChangeListener[] = [];

/**
 * 获取当前主题
 */
export function getCurrentTheme(): BpmnThemeConfig {
  return currentTheme;
}

/**
 * 设置当前主题
 * @param themeName 主题名称或主题配置对象
 * @param overrides 主题覆盖配置
 */
export function setTheme(
  themeName: string | BpmnThemeConfig,
  overrides?: ThemeOverrides
): void {
  let theme: BpmnThemeConfig;

  if (typeof themeName === 'string') {
    const predefinedTheme = predefinedThemes[themeName];
    if (!predefinedTheme) {
      throw new Error(`Theme "${themeName}" not found. Available themes: ${Object.keys(predefinedThemes).join(', ')}`);
    }
    theme = { ...predefinedTheme };
  } else {
    theme = { ...themeName };
  }

  // 应用覆盖配置
  if (overrides) {
    if (overrides.colors) {
      theme.colors = { ...theme.colors, ...overrides.colors };
    }
    if (overrides.elementStyles) {
      theme.elementStyles = { ...theme.elementStyles, ...overrides.elementStyles };
    }
  }

  // 重新生成CSS变量
  theme.cssVariables = generateCSSVariables(theme.colors);

  // 更新当前主题
  currentTheme = theme;

  // 通知监听器
  themeChangeListeners.forEach(listener => {
    try {
      listener(theme);
    } catch (error) {
      console.error('Theme change listener error:', error);
    }
  });
}

/**
 * 添加主题变更监听器
 */
export function addThemeChangeListener(listener: ThemeChangeListener): () => void {
  themeChangeListeners.push(listener);

  // 返回移除函数
  return () => {
    const index = themeChangeListeners.indexOf(listener);
    if (index > -1) {
      themeChangeListeners.splice(index, 1);
    }
  };
}

/**
 * 移除主题变更监听器
 */
export function removeThemeChangeListener(listener: ThemeChangeListener): void {
  const index = themeChangeListeners.indexOf(listener);
  if (index > -1) {
    themeChangeListeners.splice(index, 1);
  }
}

/**
 * 获取指定主题配置
 */
export function getTheme(themeName: string): BpmnThemeConfig | undefined {
  return predefinedThemes[themeName];
}

/**
 * 获取所有可用主题名称
 */
export function getAvailableThemes(): string[] {
  return Object.keys(predefinedThemes);
}

/**
 * 创建自定义主题
 * @param name 主题名称
 * @param baseTheme 基础主题名称
 * @param overrides 覆盖配置
 * @returns 自定义主题配置
 */
export function createCustomTheme(
  name: string,
  baseTheme: string = 'light',
  overrides: ThemeOverrides = {}
): BpmnThemeConfig {
  const base = predefinedThemes[baseTheme];
  if (!base) {
    throw new Error(`Base theme "${baseTheme}" not found`);
  }

  const customTheme: BpmnThemeConfig = {
    name,
    colors: { ...base.colors, ...overrides.colors },
    elementStyles: { ...base.elementStyles, ...overrides.elementStyles },
  };

  customTheme.cssVariables = generateCSSVariables(customTheme.colors);

  // 添加到预定义主题中（运行时）
  predefinedThemes[name] = customTheme;

  return customTheme;
}

/**
 * 获取元素样式（包含主题信息）
 * @param elementType 元素类型
 * @param themeName 主题名称（可选，默认使用当前主题）
 * @returns 元素样式对象
 */
export function getThemedElementStyle(
  elementType: string,
  themeName?: string
): ElementStyle {
  const theme = themeName ? predefinedThemes[themeName] : currentTheme;
  if (!theme) {
    throw new Error(`Theme "${themeName}" not found`);
  }

  return getElementStyle(elementType, 'light', theme.elementStyles);
}

/**
 * 切换到下一个主题（循环切换）
 */
export function cycleTheme(): void {
  const themeNames = getAvailableThemes();
  const currentIndex = themeNames.indexOf(currentTheme.name.toLowerCase());
  const nextIndex = (currentIndex + 1) % themeNames.length;
  const nextThemeName = themeNames[nextIndex];

  setTheme(nextThemeName);
}

/**
 * 根据系统偏好自动设置主题
 */
export function setSystemTheme(): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

/**
 * 监听系统主题变更
 */
export function watchSystemTheme(): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    setTheme(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleChange);

  // 返回清理函数
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

/**
 * 导出主题配置（用于持久化）
 */
export function exportTheme(themeName?: string): string {
  const theme = themeName ? predefinedThemes[themeName] : currentTheme;
  if (!theme) {
    throw new Error(`Theme "${themeName}" not found`);
  }

  return JSON.stringify({
    name: theme.name,
    colors: theme.colors,
    elementStyles: theme.elementStyles,
  }, null, 2);
}

/**
 * 导入主题配置
 */
export function importTheme(themeJson: string): BpmnThemeConfig {
  try {
    const themeData = JSON.parse(themeJson) as Partial<BpmnThemeConfig>;

    if (!themeData.name || !themeData.colors) {
      throw new Error('Invalid theme format');
    }

    const theme: BpmnThemeConfig = {
      name: themeData.name,
      colors: themeData.colors,
      elementStyles: themeData.elementStyles,
    };

    theme.cssVariables = generateCSSVariables(theme.colors);

    return theme;
  } catch (error) {
    throw new Error(`Failed to import theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
