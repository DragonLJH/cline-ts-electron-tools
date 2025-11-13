/**
 * BPMN 工具模块统一类型定义
 */

// =============================================================================
// 核心 BPMN 类型
// =============================================================================

export interface BpmnElement {
  id: string;
  type?: string;
  businessObject?: any;
  labelTarget?: any;
  [key: string]: any;
}

// =============================================================================
// 服务接口
// =============================================================================

export interface Injector {
  get<T>(type: string, strict?: boolean): T;
}

export interface EventBus {
  on(event: string, callback: Function, priority?: number): void;
  off(event: string, callback: Function): void;
  fire(event: string | object, data?: any): void;
  createEvent(data: any): any;
}

export interface Canvas {
  getRootElement(): any;
  zoom(level?: number | string, center?: any): void;
  scroll(delta: any): void;
  getSize(): { width: number; height: number };
  getViewbox(): any;
}

export interface ElementRegistry {
  get(id: string): any;
  getAll(): any[];
  forEach(callback: (element: any) => void): void;
  filter(callback: (element: any) => boolean): any[];
}

export interface Modeling {
  updateProperties(element: any, properties: any): void;
  updateLabel(element: any, newLabel: string, newBounds?: any): void;
  setColor(elements: any[], colors: any): void;
  removeElements(elements: any[]): void;
  moveElements(elements: any[], delta: any, target?: any): void;
}

export interface Translate {
  (key: string, params?: Record<string, any>): string;
}

export interface Rules {
  allowed(action: string, context: any): boolean | any[];
  allowed(action: string): boolean;
}

export interface CommandStack {
  execute(command: string, context: any): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}

// =============================================================================
// 提供者接口
// =============================================================================

export interface Provider {
  getGroups(element: any): Function;
  getTabs?(element: any): any[];
  getEntries?(element: any): any;
}

// =============================================================================
// 属性面板相关类型
// =============================================================================

export interface CustomPropertiesPanelConfig {
  parent?: HTMLElement | string;
  layout?: any;
  description?: any;
  tooltip?: any;
  feelPopupContainer?: HTMLElement;
  getFeelPopupLinks?: (id: string) => any[];
}

export interface PropertiesPanelConfig {
  parent?: HTMLElement | string;
  width?: number;
  height?: number;
}

export interface BpmnPropertiesPanelProps {
  element: BpmnElement;
  injector: Injector;
  getProviders: (element?: BpmnElement | BpmnElement[]) => Provider[];
  layoutConfig?: any;
  descriptionConfig?: any;
  tooltipConfig?: any;
  feelPopupContainer?: HTMLElement;
  getFeelPopupLinks?: (id: string) => any[];
}

export interface BpmnPropertiesPanelState {
  selectedElement: BpmnElement | BpmnElement[];
}

export interface PanelBoxProps {
  selectedElement: BpmnElement;
  modeling: Modeling;
  eventBus: EventBus;
  customConfig?: any;
}

// =============================================================================
// 上下文菜单相关类型
// =============================================================================

export interface ContextPadEntry {
  group: string;
  className: string;
  title: string;
  action: {
    click?: (event: any, element: any) => void;
    dragstart?: (event: any, element: any) => void;
    hover?: (event: any, element: any) => (() => void) | undefined;
  };
}

export interface ContextPadEntries {
  [key: string]: ContextPadEntry;
}

export interface ContextPadConfig {
  autoPlace?: boolean;
  [key: string]: any;
}

export interface Element {
  type: string;
  businessObject?: any;
  [key: string]: any;
}

export interface BusinessOptions {
  [key: string]: any;
}

// =============================================================================
// 调色板相关类型
// =============================================================================

export interface PaletteEntry {
  group?: string;
  className?: string;
  title?: string;
  separator?: boolean;
  action?: {
    click?: (event: any) => void;
    dragstart?: (event: any) => void;
  };
}

export interface PaletteEntries {
  [key: string]: PaletteEntry;
}

// =============================================================================
// 模块配置类型
// =============================================================================

export interface BpmnModule {
  __init__: string[];
  __depends__: any[];
  [key: string]: any;
}

export interface BpmnConfig {
  container?: HTMLElement | string;
  propertiesPanel?: {
    parent?: HTMLElement | string;
  };
  keyboard?: {
    bindTo?: Document | HTMLElement;
  };
  additionalModules?: any[];
  [key: string]: any;
}

// =============================================================================
// 导入/导出相关类型
// =============================================================================

export interface ImportResult {
  warnings: string[];
}

export interface ExportResult {
  xml?: string;
  svg?: string;
  warnings?: string[];
}

// =============================================================================
// 自定义服务类型
// =============================================================================

export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  data?: any;
}

// =============================================================================
// 工具函数类型
// =============================================================================

export type Validator<T> = (value: T) => boolean | string;
export type AsyncValidator<T> = (value: T) => Promise<boolean | string>;
export type Formatter<T> = (value: T) => string;
export type Parser<T> = (value: string) => T;

// =============================================================================
// 事件类型
// =============================================================================

export interface BpmnEvent {
  type: string;
  [key: string]: any;
}

export interface ElementChangedEvent extends BpmnEvent {
  type: 'element.changed';
  element: BpmnElement;
  properties: Record<string, any>;
}

export interface SelectionChangedEvent extends BpmnEvent {
  type: 'selection.changed';
  oldSelection: BpmnElement[];
  newSelection: BpmnElement[];
}

// =============================================================================
// 声明合并 - 扩展第三方库类型
// =============================================================================

declare module 'bpmn-js/lib/Modeler' {
  interface Modeler {
    importXML(xml: string): Promise<ImportResult>;
    saveXML(options?: { format?: boolean }): Promise<ExportResult>;
    saveSVG(): Promise<{ svg: string }>;
    get(service: 'canvas'): Canvas;
    get(service: 'elementRegistry'): ElementRegistry;
    get(service: 'modeling'): Modeling;
    get(service: 'eventBus'): EventBus;
    get(service: 'commandStack'): CommandStack;
    get(service: 'rules'): Rules;
    get(service: string): any;
  }
}

// 注意：第三方库的类型声明在 types.d.ts 文件中

// =============================================================================
// 全局类型声明
// =============================================================================

declare global {
  interface Document {
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
  }

  interface HTMLElement {
    msRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  }

  interface Element {
    isImplicit?: boolean;
  }
}
