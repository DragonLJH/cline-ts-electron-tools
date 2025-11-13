import CustomModeler, { CustomModelerOptions, ImportResult, ExportResult } from './CustomModeler';

// 导出类本身
export { CustomModeler };

// 导出类型
export type { CustomModelerOptions, ImportResult, ExportResult };

// 默认导出
export default CustomModeler;

// 兼容性导出 - 为 BPMN 路由组件提供所需的接口
export const CustomModelerRenderer = CustomModeler;
