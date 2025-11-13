import defaultModule from './CustomContextPadProvider';

// 导出默认模块 - BPMN-JS格式
export default defaultModule;

// 兼容性导出
export const contextPadProviderModule = defaultModule;

// 类型定义导出
export type {
  ContextPadEntry,
  ContextPadEntries,
  ContextPadConfig,
  Element,
  BusinessOptions
} from './CustomContextPadProvider';
