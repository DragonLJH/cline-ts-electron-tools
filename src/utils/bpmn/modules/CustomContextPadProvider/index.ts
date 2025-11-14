import defaultModule from './CustomContextPadProvider';
import type { BusinessOptions } from '../../utils/bpmnElementFactory';

// 导出默认模块 - BPMN-JS格式
export default defaultModule;

// 兼容性导出
export const contextPadProviderModule = defaultModule;

// 类型定义导出
export type {
  ContextPadEntry,
  ContextPadEntries,
  ContextPadConfig,
  Element
} from './CustomContextPadProvider';

// 从新的通用模块导出BusinessOptions
export type { BusinessOptions };
