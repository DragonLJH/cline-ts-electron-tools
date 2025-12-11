/**
 * BPMN Color Palette - 基于Tailwind CSS的颜色系统
 * 为BPMN元素提供统一的颜色映射
 */

export interface BpmnColorPalette {
  // 基础颜色
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;

  // 中性色
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;

  // 元素专用色
  startEvent: string;
  endEvent: string;
  userTask: string;
  serviceTask: string;
  gateway: string;
  connection: string;
  label: string;
}

/**
 * 亮色主题颜色配置
 */
export const lightThemeColors: BpmnColorPalette = {
  // 基础颜色 - 使用Tailwind蓝色系
  primary: '#3b82f6',      // blue-500
  secondary: '#6b7280',    // gray-500
  success: '#10b981',      // emerald-500
  warning: '#f59e0b',      // amber-500
  error: '#ef4444',        // red-500
  info: '#06b6d4',         // cyan-500

  // 中性色
  background: '#ffffff',
  surface: '#f9fafb',      // gray-50
  border: '#e5e7eb',       // gray-200
  text: '#111827',         // gray-900
  textSecondary: '#6b7280', // gray-500

  // BPMN元素专用色
  startEvent: '#10b981',   // emerald-500 - 开始事件用绿色
  endEvent: '#ef4444',     // red-500 - 结束事件用红色
  userTask: '#3b82f6',     // blue-500 - 用户任务用蓝色
  serviceTask: '#8b5cf6',  // violet-500 - 服务任务用紫色
  gateway: '#f59e0b',      // amber-500 - 网关用橙色
  connection: '#6b7280',   // gray-500 - 连接线用灰色
  label: '#374151',        // gray-700 - 标签用深灰色
};

/**
 * 暗色主题颜色配置
 */
export const darkThemeColors: BpmnColorPalette = {
  // 基础颜色 - 暗色版本
  primary: '#60a5fa',      // blue-400
  secondary: '#9ca3af',    // gray-400
  success: '#34d399',      // emerald-400
  warning: '#fbbf24',      // amber-400
  error: '#f87171',        // red-400
  info: '#22d3ee',         // cyan-400

  // 中性色
  background: '#111827',   // gray-900
  surface: '#1f2937',      // gray-800
  border: '#374151',       // gray-700
  text: '#f9fafb',         // gray-50
  textSecondary: '#d1d5db', // gray-300

  // BPMN元素专用色 - 暗色版本
  startEvent: '#34d399',   // emerald-400
  endEvent: '#f87171',     // red-400
  userTask: '#60a5fa',     // blue-400
  serviceTask: '#a78bfa',  // violet-400
  gateway: '#fbbf24',      // amber-400
  connection: '#9ca3af',   // gray-400
  label: '#e5e7eb',        // gray-200
};

/**
 * 获取当前主题的颜色配置
 * @param theme 主题名称 ('light' | 'dark')
 * @returns 颜色配置对象
 */
export function getThemeColors(theme: 'light' | 'dark' = 'light'): BpmnColorPalette {
  return theme === 'dark' ? darkThemeColors : lightThemeColors;
}

/**
 * 根据元素类型获取对应的颜色
 * @param elementType BPMN元素类型
 * @param theme 主题名称
 * @returns 颜色值
 */
export function getElementColor(
  elementType: keyof Pick<BpmnColorPalette,
    'startEvent' | 'endEvent' | 'userTask' | 'serviceTask' | 'gateway' | 'connection' | 'label'>,
  theme: 'light' | 'dark' = 'light'
): string {
  const colors = getThemeColors(theme);
  return colors[elementType];
}

/**
 * Tailwind CSS类名映射
 * 用于在组件中直接使用Tailwind类
 */
export const tailwindColorClasses = {
  light: {
    primary: 'text-blue-500 bg-blue-500 border-blue-500',
    success: 'text-emerald-500 bg-emerald-500 border-emerald-500',
    warning: 'text-amber-500 bg-amber-500 border-amber-500',
    error: 'text-red-500 bg-red-500 border-red-500',
    background: 'bg-white',
    surface: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
  },
  dark: {
    primary: 'text-blue-400 bg-blue-400 border-blue-400',
    success: 'text-emerald-400 bg-emerald-400 border-emerald-400',
    warning: 'text-amber-400 bg-amber-400 border-amber-400',
    error: 'text-red-400 bg-red-400 border-red-400',
    background: 'bg-gray-900',
    surface: 'bg-gray-800',
    border: 'border-gray-700',
    text: 'text-gray-50',
    textSecondary: 'text-gray-300',
  }
} as const;
