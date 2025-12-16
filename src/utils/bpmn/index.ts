import { DEFAULT_BPMN_CONFIG, VERSION_INFO, FEATURES as FEATURES_LIST } from './utils/constants';

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
} from './core/types';

// =============================================================================
// 核心组件导出
// =============================================================================

// 1. 自定义建模器 - BPMN的核心接口
export { default as CustomModeler } from './core/CustomModeler/CustomModeler';

// 2. XML字符串工具 - XML格式支持
export { initialDiagram } from './core/xmlStr';

// 3. 自定义XML解析器 - 不依赖bpmn-js的XML解析
export { importXML, CustomBpmnXmlParser } from './utils/xmlImporter';

// XML解析器相关类型
export type {
  BpmnParseResult,
  BpmnBaseElement,
  BpmnProcess,
  BpmnStartEvent,
  BpmnEndEvent,
  BpmnUserTask,
  BpmnExclusiveGateway,
  BpmnParallelGateway,
  BpmnSequenceFlow
} from './utils/xmlImporter';

// =============================================================================
// 定制功能模块导出
// =============================================================================

// 导入要导出的模块用于配置常量
import CustomPropertiesPanelModule, {
    CustomPropertiesPanelRenderer,
    propertiesPanelModule
} from './modules/CustomPropertiesPanel';

import {
    contextPadProviderModule
} from './modules/CustomContextPadProvider';

// 3. 属性面板模块 - BPMN元素属性编辑
export {
    default as CustomPropertiesPanelModule,
    CustomPropertiesPanelRenderer,
    propertiesPanelModule
} from './modules/CustomPropertiesPanel';

// 属性面板类型导出
export type {
    PropertiesPanelConfig
} from './modules/CustomPropertiesPanel';

// 4. 右键菜单模块 - 上下文操作
export {
    contextPadProviderModule
} from './modules/CustomContextPadProvider';

// 上下文中菜单相关类型
export type {
    ContextPadEntry,
    ContextPadEntries,
    ContextPadConfig,
} from './modules/CustomContextPadProvider';

import paletteProviderModule from './modules/CustomPaletteProvider';

// 5. 调色板提供者模块 - 元素选择和创建工具
export {
    default as paletteProviderModule,
} from './modules/CustomPaletteProvider';

import tokenSimulationModelerModule, {
    createTokenSimulationModule,
    tokenSimulationViewerModule
} from './modules/CustomTokenSimulationModule';

// 6. 令牌模拟模块 - BPMN流程令牌模拟功能
export {
    default as tokenSimulationModule,
    tokenSimulationModelerModule,
    tokenSimulationViewerModule,
    createTokenSimulationModule
} from './modules/CustomTokenSimulationModule';

// Token Simulation类型导出
export type {
    TokenSimulationConfig
} from './modules/CustomTokenSimulationModule';

// =============================================================================
// 便捷导入 - 常用组合
// =============================================================================

/**
 * BPMN建模器的标准附加模块集
 * 包含属性面板、右键菜单、调色板和令牌模拟功能
 */
export const standardBpmnModules = [
    CustomPropertiesPanelModule,
    contextPadProviderModule,
    paletteProviderModule,
    tokenSimulationModelerModule
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
    ...DEFAULT_BPMN_CONFIG,
    additionalModules: standardBpmnModules
};

// =============================================================================
// 版本信息和元数据
// =============================================================================

export const { VERSION, SUPPORTED_BPMN_JS_VERSION } = VERSION_INFO;
export const FEATURES = FEATURES_LIST;

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
} from './core/types';
