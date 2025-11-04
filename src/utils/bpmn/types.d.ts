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
}
