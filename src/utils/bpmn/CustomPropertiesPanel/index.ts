import defaultModule from './CustomPropertiesPanel';
import { CustomPropertiesPanel } from './CustomPropertiesPanel';

// 导出类本身
export { CustomPropertiesPanel };
export { default as CustomPropertiesPanelModule } from './CustomPropertiesPanel';

// 兼容性导出 - 为 BPMN 路由组件提供所需的接口
export const CustomPropertiesPanelRenderer = CustomPropertiesPanel;

// 默认导出 - BPMN-JS 模块格式
export default defaultModule;

// 类型导出
export type {
    CustomPropertiesPanelConfig,
    BpmnElement,
    BpmnPropertiesPanelProps,
    PanelBoxProps
} from '../types';

// 其他兼容性接口（如果需要）
export interface PropertiesPanelConfig {
    parent?: HTMLElement | string;
    width?: number;
    height?: number;
}

// BPMN-JS 标准模块格式
export const propertiesPanelModule = defaultModule;
