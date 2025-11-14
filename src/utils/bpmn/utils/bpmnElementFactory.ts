import { assign } from 'min-dash';

export interface BusinessOptions {
  [key: string]: any;
}

export interface ActionEntry {
  group: string;
  className: string;
  title: string;
  action: {
    click?: (event: any) => void;
    dragstart?: (event: any) => void;
  };
}

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

/**
 * BPMN Element Factory Service
 * Provides unified element creation and action generation for BPMN elements
 */
export class BpmnElementFactory {
  private _elementFactory: any;
  private _create: any;
  private _translate: (key: string, options?: Record<string, any>) => string;
  private _autoPlace?: any;
  private _appendPreview?: any;

  static $inject = [
    'elementFactory',
    'create',
    'translate',
    'autoPlace',
    'appendPreview'
  ];

  constructor(
    elementFactory: any,
    create: any,
    translate: (key: string, options?: Record<string, any>) => string,
    autoPlace?: any,
    appendPreview?: any
  ) {
    this._elementFactory = elementFactory;
    this._create = create;
    this._translate = translate;
    this._autoPlace = autoPlace;
    this._appendPreview = appendPreview;
  }

  /**
   * Utility function to recursively insert business options into a BPMN element
   * @param setFn - Function to set a key-value pair on the business object
   * @param options - Business options to apply
   */
  private insertBusinessOptions(setFn: (key: string, value: any) => void, options: BusinessOptions) {
    const setOptionsRecursively = (options: BusinessOptions) => {
      Object.entries(options).forEach(([key, value]) => {
        if (Object.prototype.toString.call(value) === '[object Object]') {
          setOptionsRecursively(value);
        } else {
          setFn(key, value);
        }
      });
    };
    setOptionsRecursively(options);
  }

  /**
   * Create a BPMN element shape with business options applied
   * @param type - BPMN element type (e.g., 'bpmn:StartEvent')
   * @param options - Additional options for shape creation
   * @param businessOptions - Business options to apply to the element
   * @returns The created shape with business options applied
   */
  createBpmnElement(type: string, options?: any, businessOptions?: BusinessOptions) {
    const shape = this._elementFactory.createShape(assign({ type }, options));

    // Apply business options if they exist
    if (businessOptions && Object.keys(businessOptions).length > 0) {
      this.insertBusinessOptions((key: string, value: any) => shape.businessObject.set(key, value), businessOptions);
    }

    return shape;
  }

  /**
   * Create an action entry for palette (simple drag and click)
   * @param type - BPMN element type
   * @param group - Palette group
   * @param className - CSS class name
   * @param title - Action title
   * @param options - Additional options
   * @param businessOptions - Business options to apply
   * @returns Action entry for palette
   */
  createPaletteAction(
    type: string,
    group: string,
    className: string,
    title?: string,
    options?: any,
    businessOptions?: BusinessOptions
  ): ActionEntry {
    const shortType = type.replace(/^bpmn:/, '');
    const createListener = (event: any) => {
      const shape = this.createBpmnElement(type, options, businessOptions);
      this._create.start(event, shape);
    };

    return {
      group,
      className,
      title: title || this._translate('Create {type}', { type: shortType }),
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  /**
   * Create an action entry for context pad (with append functionality)
   * @param type - BPMN element type
   * @param className - CSS class name
   * @param title - Action title
   * @param options - Additional options
   * @param businessOptions - Business options to apply
   * @param sourceElement - Source element for append operation
   * @returns Action entry for context pad
   */
  createContextPadAction(
    type: string,
    className: string,
    title?: string,
    options?: any,
    businessOptions?: BusinessOptions,
    sourceElement?: any
  ): ContextPadEntry {
    const shortType = type.replace(/^bpmn:/, '');

    if (typeof title !== 'string') {
      options = title;
      title = this._translate('Append {type}', { type: shortType });
    }

    const appendStart = (event: any, element: any) => {
      const shape = this.createBpmnElement(type, options, businessOptions);
      this._create.start(event, shape, { source: element });
      this._appendPreview?.cleanUp();
    };

    const appendAuto = this._autoPlace ? (event: any, element: any) => {
      const shape = this.createBpmnElement(type, options, businessOptions);
      this._autoPlace.append(element, shape);
      this._appendPreview?.cleanUp();
    } : appendStart;

    const previewAppend = this._autoPlace ? (event: any, element: any) => {
      this._appendPreview?.create(element, type, options);
      return () => this._appendPreview?.cleanUp();
    } : undefined;

    return {
      group: 'model',
      className: className,
      title: title!,
      action: {
        dragstart: appendStart,
        click: appendAuto,
        hover: previewAppend
      }
    };
  }
}

// Export as default module for bpmn-js integration
export default {
  __init__: ['bpmnElementFactory'],
  bpmnElementFactory: ['type', BpmnElementFactory]
};
