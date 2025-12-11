/**
 * BPMN Styles - 样式系统统一导出
 * 提供完整的BPMN样式定制功能
 */

// 颜色系统
export * from './color-palette';

// 元素样式
export * from './element-styles';

// 主题系统
export * from './bpmn-theme';

// 类型定义
export type { BpmnColorPalette } from './color-palette';
export type { ElementStyle, BpmnElementStyles } from './element-styles';
export type { BpmnThemeConfig, ThemeOverrides } from './bpmn-theme';

// 便捷函数
export { getThemeColors, getElementColor } from './color-palette';
export { getElementStyle, generateCSSVariables, mergeStyles } from './element-styles';
export {
  getCurrentTheme,
  setTheme,
  getAvailableThemes,
  createCustomTheme,
  setSystemTheme,
  watchSystemTheme,
} from './bpmn-theme';
