import defaultModule from './CustomConfigService';

// 默认导出 - BPMN-JS 模块格式
export default defaultModule;

// 兼容性导出
export const configServiceModule = defaultModule;

// 类型导出
export type { PropertiesConfig } from './CustomConfigService';
