// Custom Type Declarations for bpmn-js-properties-panel

declare module 'bpmn-js-properties-panel' {

  export class BpmnPropertiesPanelRenderer {
    constructor(config: any, injector: any, eventBus: any);
    attachTo(parentElement: HTMLElement): void;
    detach(): void;
    update(element?: any): void;
  }

  export interface BpmnPropertiesPanelContext {
    element?: any;
    properties?: any;
    [key: string]: any;
  }

  export interface PropertiesPanel {
    attachTo(parentElement: HTMLElement): void;
    detach(): void;
    update(element?: any): void;
  }

  export interface BpmnPropertiesPanelModule {
    __init__: string[];
    [key: string]: any;
  }
}

// Additional types for CustomPropertiesPanel
export interface CustomPropertiesPanelConfig {
  parent?: HTMLElement | string;
  layout?: any;
  description?: any;
  tooltip?: any;
  feelPopupContainer?: HTMLElement;
  getFeelPopupLinks?: (id: string) => any[];
}

export interface Injector {
  get<T>(type: string, strict?: boolean): T;
}

export interface EventBus {
  on(event: string, callback: Function, priority?: number): void;
  off(event: string, callback: Function): void;
  fire(event: string | object, data?: any): void;
  createEvent(data: any): any;
}

export interface Provider {
  getGroups(element: any): Function;
}

export interface ElementRegistry {
  get(id: string): any;
}

export interface Canvas {
  getRootElement(): any;
}

export interface Modeling {
  updateProperties(element: any, properties: any): void;
}

export interface Translate {
  (key: string): string;
}

export interface BpmnElement {
  id: string;
  type?: string;
  businessObject?: any;
  labelTarget?: any;
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

// Global declarations for DOM elements
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
