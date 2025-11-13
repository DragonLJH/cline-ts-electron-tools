import defaultModule from './CustomPaletteProvider';

// 导出默认模块 - BPMN-JS格式
export default defaultModule;

// 兼容性导出
export const paletteProviderModule = defaultModule;

// 类型定义导出 - 由于接口是内部定义的，这里暂时只导出主要的
export type {
    // Palette,     // 暂时注释，这些接口在bpmn-js项目中不需要独立导出
    // Create,
    // ElementFactory,
    // Tool,
    // Translate,
    // PaletteEntries
} from './CustomPaletteProvider';
