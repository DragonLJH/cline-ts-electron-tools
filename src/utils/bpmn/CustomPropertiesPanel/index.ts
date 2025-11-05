/**
 * Custom BPMN Properties Panel Module Exports
 *
 * 这个目录包含两种不同的属性面板实现方式：
 * - 独立的自定义实现 (CustomPropertiesPanelRenderer)
 * - 概念性的继承演示 (ConceptualInheritedPropertiesPanel)
 *
 * 🚀 生产推荐：使用独立的自定义实现
 * 🎓 教育演示：查看概念性继承模式
 */

import {
  CustomPropertiesPanelRenderer,
  CustomPropertiesPanelModule,
  defaultCustomPropertiesConfig,
  CustomPropertiesConfig as StandaloneConfig
} from './CustomPropertiesPanel';

import ConceptualInheritedPropertiesPanel, {
  InheritedPropertiesPanelModule,
  defaultInheritedConfig,
  InheritedPropertiesConfig
} from './InheritedPropertiesPanel';

// 导出独立的自定义实现（生产推荐）
export { CustomPropertiesPanelRenderer };

// 导出概念性继承演示（教育用途）
export { ConceptualInheritedPropertiesPanel };

// 导出模块配置
export {
  CustomPropertiesPanelModule,      // 独立实现模块（推荐）
  InheritedPropertiesPanelModule     // 概念性继承模块
};

// 导出默认配置
export {
  defaultCustomPropertiesConfig,     // 独立实现配置
  defaultInheritedConfig             // 概念性继承配置
};

// 兼容性导出
export {
  StandaloneConfig,                  // 独立配置别名
  InheritedPropertiesConfig         // 继承配置别名
};

// 导出默认（独立实现）
export { CustomPropertiesPanelRenderer as default };

// 附加导出
export { ConceptualInheritedPropertiesPanel as InheritanceExample };
