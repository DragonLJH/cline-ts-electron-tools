/**
 * BPMN Element Styles - 元素样式定义
 * 定义不同BPMN元素的视觉样式
 */

import { BpmnColorPalette } from './color-palette';

export interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
  rx?: number; // 圆角半径
  ry?: number;
}

export interface BpmnElementStyles {
  [elementType: string]: ElementStyle;
}

/**
 * 默认元素样式配置
 */
export const defaultElementStyles: BpmnElementStyles = {
  // 事件
  'bpmn:StartEvent': {
    fill: 'var(--bpmn-start-event-fill, #10b981)',
    stroke: 'var(--bpmn-start-event-stroke, #059669)',
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
  },
  'bpmn:EndEvent': {
    fill: 'var(--bpmn-end-event-fill, #ef4444)',
    stroke: 'var(--bpmn-end-event-stroke, #dc2626)',
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
  },
  'bpmn:IntermediateThrowEvent': {
    fill: 'var(--bpmn-intermediate-fill, #f59e0b)',
    stroke: 'var(--bpmn-intermediate-stroke, #d97706)',
    strokeWidth: 2,
  },
  'bpmn:IntermediateCatchEvent': {
    fill: 'var(--bpmn-intermediate-fill, #f59e0b)',
    stroke: 'var(--bpmn-intermediate-stroke, #d97706)',
    strokeWidth: 2,
  },

  // 任务
  'bpmn:UserTask': {
    fill: 'var(--bpmn-user-task-fill, #3b82f6)',
    stroke: 'var(--bpmn-user-task-stroke, #2563eb)',
    strokeWidth: 2,
    rx: 8,
    ry: 8,
  },
  'bpmn:ServiceTask': {
    fill: 'var(--bpmn-service-task-fill, #8b5cf6)',
    stroke: 'var(--bpmn-service-task-stroke, #7c3aed)',
    strokeWidth: 2,
    rx: 8,
    ry: 8,
  },
  'bpmn:ManualTask': {
    fill: 'var(--bpmn-manual-task-fill, #06b6d4)',
    stroke: 'var(--bpmn-manual-task-stroke, #0891b2)',
    strokeWidth: 2,
    rx: 8,
    ry: 8,
  },
  'bpmn:BusinessRuleTask': {
    fill: 'var(--bpmn-business-rule-fill, #f59e0b)',
    stroke: 'var(--bpmn-business-rule-stroke, #d97706)',
    strokeWidth: 2,
    rx: 8,
    ry: 8,
  },
  'bpmn:ScriptTask': {
    fill: 'var(--bpmn-script-task-fill, #10b981)',
    stroke: 'var(--bpmn-script-task-stroke, #059669)',
    strokeWidth: 2,
    rx: 8,
    ry: 8,
  },

  // 网关
  'bpmn:ExclusiveGateway': {
    fill: 'var(--bpmn-gateway-fill, #f59e0b)',
    stroke: 'var(--bpmn-gateway-stroke, #d97706)',
    strokeWidth: 2,
  },
  'bpmn:InclusiveGateway': {
    fill: 'var(--bpmn-gateway-fill, #f59e0b)',
    stroke: 'var(--bpmn-gateway-stroke, #d97706)',
    strokeWidth: 2,
  },
  'bpmn:ParallelGateway': {
    fill: 'var(--bpmn-gateway-fill, #f59e0b)',
    stroke: 'var(--bpmn-gateway-stroke, #d97706)',
    strokeWidth: 2,
  },

  // 子流程
  'bpmn:SubProcess': {
    fill: 'var(--bpmn-subprocess-fill, #ffffff)',
    stroke: 'var(--bpmn-subprocess-stroke, #6b7280)',
    strokeWidth: 2,
    rx: 12,
    ry: 12,
  },
  'bpmn:CallActivity': {
    fill: 'var(--bpmn-call-activity-fill, #ffffff)',
    stroke: 'var(--bpmn-call-activity-stroke, #3b82f6)',
    strokeWidth: 3, // 更粗的边框表示调用活动
    rx: 12,
    ry: 12,
  },

  // 数据对象
  'bpmn:DataObjectReference': {
    fill: 'var(--bpmn-data-object-fill, #ffffff)',
    stroke: 'var(--bpmn-data-object-stroke, #6b7280)',
    strokeWidth: 2,
  },
  'bpmn:DataStoreReference': {
    fill: 'var(--bpmn-data-store-fill, #ffffff)',
    stroke: 'var(--bpmn-data-store-stroke, #6b7280)',
    strokeWidth: 2,
  },

  // 连接线
  'bpmn:SequenceFlow': {
    stroke: 'var(--bpmn-connection-stroke, #6b7280)',
    strokeWidth: 2,
    fillOpacity: 0,
  },
  'bpmn:MessageFlow': {
    stroke: 'var(--bpmn-message-flow-stroke, #3b82f6)',
    strokeWidth: 2,
    strokeDasharray: '8,4',
    fillOpacity: 0,
  },
  'bpmn:Association': {
    stroke: 'var(--bpmn-association-stroke, #9ca3af)',
    strokeWidth: 2,
    strokeDasharray: '4,4',
    fillOpacity: 0,
  },
};

/**
 * 获取元素样式
 * @param elementType 元素类型
 * @param theme 主题
 * @param customStyles 自定义样式覆盖
 * @returns 元素样式对象
 */
export function getElementStyle(
  elementType: string,
  theme: 'light' | 'dark' = 'light',
  customStyles?: Partial<BpmnElementStyles>
): ElementStyle {
  const baseStyle = defaultElementStyles[elementType] || {};
  const customStyle = customStyles?.[elementType] || {};

  return {
    ...baseStyle,
    ...customStyle,
  };
}

/**
 * 生成CSS变量样式对象
 * @param colors 颜色配置
 * @returns CSS变量样式对象
 */
export function generateCSSVariables(colors: BpmnColorPalette): Record<string, string> {
  return {
    '--bpmn-primary': colors.primary,
    '--bpmn-secondary': colors.secondary,
    '--bpmn-success': colors.success,
    '--bpmn-warning': colors.warning,
    '--bpmn-error': colors.error,
    '--bpmn-info': colors.info,
    '--bpmn-background': colors.background,
    '--bpmn-surface': colors.surface,
    '--bpmn-border': colors.border,
    '--bpmn-text': colors.text,
    '--bpmn-text-secondary': colors.textSecondary,

    // BPMN元素专用变量
    '--bpmn-start-event-fill': colors.startEvent,
    '--bpmn-start-event-stroke': colors.startEvent,
    '--bpmn-end-event-fill': colors.endEvent,
    '--bpmn-end-event-stroke': colors.endEvent,
    '--bpmn-user-task-fill': colors.userTask,
    '--bpmn-user-task-stroke': colors.userTask,
    '--bpmn-service-task-fill': colors.serviceTask,
    '--bpmn-service-task-stroke': colors.serviceTask,
    '--bpmn-gateway-fill': colors.gateway,
    '--bpmn-gateway-stroke': colors.gateway,
    '--bpmn-connection-stroke': colors.connection,
    '--bpmn-label-color': colors.label,
  };
}

/**
 * 样式优先级配置
 * 用于处理样式层叠和覆盖
 */
export const stylePriority = {
  // 基础样式
  base: 1,
  // 主题样式
  theme: 10,
  // 元素类型样式
  elementType: 20,
  // 用户自定义样式
  custom: 100,
  // 选中状态样式
  selected: 200,
  // 悬停状态样式
  hover: 150,
} as const;

/**
 * 合并样式对象
 * @param styles 样式对象数组
 * @returns 合并后的样式对象
 */
export function mergeStyles(...styles: (ElementStyle | undefined)[]): ElementStyle {
  return styles.reduce<ElementStyle>((merged, style) => {
    if (!style) return merged;
    return { ...merged, ...style };
  }, {} as ElementStyle);
}

/**
 * 验证样式对象的有效性
 * @param style 样式对象
 * @returns 是否有效
 */
export function validateStyle(style: ElementStyle): boolean {
  // 检查颜色值格式
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^var\(--[^)]+\)$/;

  if (style.fill && !colorRegex.test(style.fill)) return false;
  if (style.stroke && !colorRegex.test(style.stroke)) return false;

  // 检查数值类型
  if (style.strokeWidth !== undefined && style.strokeWidth < 0) return false;
  if (style.fillOpacity !== undefined && (style.fillOpacity < 0 || style.fillOpacity > 1)) return false;
  if (style.strokeOpacity !== undefined && (style.strokeOpacity < 0 || style.strokeOpacity > 1)) return false;

  return true;
}
