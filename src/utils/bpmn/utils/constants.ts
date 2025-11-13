/**
 * BPMN 工具模块常量和配置
 */

// BPMN 命名空间常量
export const BPMN_NAMESPACES = {
  BPMN: 'http://www.omg.org/spec/BPMN/20100524/MODEL',
  BPMNDI: 'http://www.omg.org/spec/BPMN/20100524/DI',
  DC: 'http://www.omg.org/spec/DD/20100524/DC',
  DI: 'http://www.omg.org/spec/DD/20100524/DI',
  XSI: 'http://www.w3.org/2001/XMLSchema-instance'
} as const;

// 默认模块配置
export const DEFAULT_MODULE_CONFIG = {
  __depends__: [],
  __init__: []
} as const;

// BPMN 元素类型映射
export const BPMN_ELEMENT_TYPES = {
  START_EVENT: 'bpmn:StartEvent',
  END_EVENT: 'bpmn:EndEvent',
  USER_TASK: 'bpmn:UserTask',
  EXCLUSIVE_GATEWAY: 'bpmn:ExclusiveGateway',
  PARALLEL_GATEWAY: 'bpmn:ParallelGateway',
  SEQUENCE_FLOW: 'bpmn:SequenceFlow'
} as const;

// 工具栏分组
export const PALETTE_GROUPS = {
  EVENT: 'event',
  ACTIVITY: 'activity',
  GATEWAY: 'gateway',
  TOOLS: 'tools'
} as const;

// 上下文菜单分组
export const CONTEXT_PAD_GROUPS = {
  EDIT: 'edit',
  CONNECT: 'connect',
  MODEL: 'model',
  VALIDATE: 'validate'
} as const;

// 默认配置对象
export const DEFAULT_BPMN_CONFIG = {
  container: null,
  propertiesPanel: {
    parent: null
  },
  keyboard: {
    bindTo: document
  },
  additionalModules: []
} as const;

// 版本信息
export const VERSION_INFO = {
  VERSION: '1.0.0',
  SUPPORTED_BPMN_JS_VERSION: '>=13.0.0'
} as const;

// 功能列表
export const FEATURES = [
  'CustomModeler - 扩展BPMN建模器',
  'CustomPropertiesPanel - React属性面板',
  'CustomContextPadProvider - 右键上下文菜单',
  'CustomPaletteProvider - 工具调色板',
  'Type-safe interfaces - TypeScript类型安全'
] as const;

// 错误代码
export const ERROR_CODES = {
  INVALID_XML: 'INVALID_XML',
  CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
  INVALID_CONTAINER: 'INVALID_CONTAINER',
  IMPORT_FAILED: 'IMPORT_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED'
} as const;
