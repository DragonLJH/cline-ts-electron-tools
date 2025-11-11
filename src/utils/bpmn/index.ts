// =============================================================================
// BPMN集成模块统一导出文件
// 提供完整的BPMN建模功能集成解决方案
// =============================================================================

// =============================================================================
// 类型定义导出
// =============================================================================
export type {
    // 核心BPMN类型
    BpmnElement,

    // 服务类型
    Injector,
    EventBus,
    Canvas,
    ElementRegistry,
    Modeling,
    Translate,

    // 提供者类型
    Provider,

    // 属性面板类型
    CustomPropertiesPanelConfig,
    BpmnPropertiesPanelProps,
    BpmnPropertiesPanelState,
    PanelBoxProps,

    // 调色板提供者类型 - 只有必要的，内部接口不需要暴露
} from './types';

// =============================================================================
// 核心组件导出
// =============================================================================

// 1. 自定义建模器 - BPMN的核心接口
export { default as CustomModeler } from './CustomModeler';

// 2. XML字符串工具 - XML格式支持
export { initialDiagram } from './xmlStr';

// =============================================================================
// 定制功能模块导出
// =============================================================================

// 导入要导出的模块用于配置常量
import CustomPropertiesPanelModule, {
    CustomPropertiesPanelRenderer,
    propertiesPanelModule
} from './CustomPropertiesPanel';

import {
    contextPadProviderModule,
    StandaloneContextPadProvider,
    InheritedContextPadProvider,
} from './CustomContextPadProvider';

// 3. 属性面板模块 - BPMN元素属性编辑
export {
    default as CustomPropertiesPanelModule,
    CustomPropertiesPanelRenderer,
    propertiesPanelModule
} from './CustomPropertiesPanel';

// 属性面板类型导出
export type {
    PropertiesPanelConfig
} from './CustomPropertiesPanel';

// 4. 右键菜单模块 - 上下文操作
export {
    contextPadProviderModule,
    StandaloneContextPadProvider,
    InheritedContextPadProvider,
} from './CustomContextPadProvider';

// 上下文中菜单相关类型
export type {
    ContextPadEntry,
    ContextPadEntries,
    ContextPadConfig,
} from './CustomContextPadProvider';

import paletteProviderModule from './CustomPaletteProvider';

// 5. 调色板提供者模块 - 元素选择和创建工具
export {
    default as paletteProviderModule,
} from './CustomPaletteProvider';

// =============================================================================
// 便捷导入 - 常用组合
// =============================================================================

/**
 * BPMN建模器的标准附加模块集
 * 包含属性面板、右键菜单和调色板功能
 */
export const standardBpmnModules = [
    CustomPropertiesPanelModule,
    contextPadProviderModule,
    paletteProviderModule
];

/**
 * 最小化BPMN模块集
 * 只包含基础的属性面板功能
 */
export const minimalBpmnModules = [
    CustomPropertiesPanelModule
];

/**
 * 完整BPMN配置对象示例
 */
export const defaultBpmnConfig = {
    container: null, // 需要在运行时设置DOM元素
    propertiesPanel: {
        parent: null // 需要在运行时设置DOM元素
    },
    keyboard: {
        bindTo: document // 键盘事件绑定到文档
    },
    additionalModules: standardBpmnModules
};

// =============================================================================
// 版本信息和元数据
// =============================================================================

/**
 * BPMN集成版本信息
 */
export const VERSION = '1.0.0';

/**
 * 支持的BPMN-JS版本
 */
export const SUPPORTED_BPMN_JS_VERSION = '>=13.0.0';

/**
 * 模块功能说明
 */
export const FEATURES = [
    'CustomModeler - 扩展BPMN建模器',
    'CustomPropertiesPanel - React属性面板',
    'CustomContextPadProvider - 右键上下文菜单',
    'CustomPaletteProvider - 工具调色板',
    'Type-safe interfaces - TypeScript类型安全'
] as const;

// =============================================================================
// 向后兼容性导出
// =============================================================================

// 为了向后兼容导出的别名
export const BpmnCustomModules = standardBpmnModules;
export const BpmnConfig = defaultBpmnConfig;

// =============================================================================
// 类型重导出 - 用于外部类型定义
// =============================================================================

export type {
    // 重导出给使用方需要的类型
    Injector as BpmnInjector,
    EventBus as BpmnEventBus,
    Canvas as BpmnCanvas,
} from './types';
