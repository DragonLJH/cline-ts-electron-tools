import { assign } from 'min-dash';
import CustomLoggerModule from '../modules/CustomLoggerService/CustomLoggerService'

import type { CustomLoggerService } from '../modules/CustomLoggerService/CustomLoggerService'

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
  private _logger: CustomLoggerService

  static $inject = [
    'elementFactory',
    'create',
    'translate',
    'customLogger',
    'autoPlace',
    'appendPreview'
  ];

  constructor(
    elementFactory: any,
    create: any,
    translate: (key: string, options?: Record<string, any>) => string,
    customLogger: CustomLoggerService,
    autoPlace?: any,
    appendPreview?: any,
  ) {
    this._elementFactory = elementFactory;
    this._create = create;
    this._translate = translate;
    this._autoPlace = autoPlace;
    this._appendPreview = appendPreview;
    this._logger = customLogger;

    this._logger.info('BpmnElementFactory initialized successfully', {
      hasAutoPlace: !!this._autoPlace,
      hasAppendPreview: !!this._appendPreview
    });
  }

  /**
   * Utility function to recursively insert business options into a BPMN element
   * @param setFn - Function to set a key-value pair on the business object
   * @param options - Business options to apply
   */
  private insertBusinessOptions(setFn: (key: string, value: any) => void, options: BusinessOptions) {
    this._logger.info('Starting business options insertion', { optionCount: Object.keys(options).length });

    const setOptionsRecursively = (options: BusinessOptions, depth: number = 0) => {
      this._logger.info('Processing options at depth', { depth, keys: Object.keys(options) });

      Object.entries(options).forEach(([key, value]) => {
        if (Object.prototype.toString.call(value) === '[object Object]') {
          this._logger.info('Processing nested object', { key, nestedKeys: Object.keys(value) });
          setOptionsRecursively(value, depth + 1);
        } else {
          try {
            setFn(key, value);
            this._logger.info('Business option set successfully', { key, valueType: typeof value });
          } catch (error) {
            this._logger.error('Failed to set business option', { key, value, depth, error: error instanceof Error ? error.message : String(error) });
          }
        }
      });
    };

    try {
      setOptionsRecursively(options);
      this._logger.info('Business options insertion completed');
    } catch (error) {
      this._logger.error('Business options insertion failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Create a BPMN element shape with business options applied
   * @param type - BPMN element type (e.g., 'bpmn:StartEvent')
   * @param options - Additional options for shape creation
   * @param businessOptions - Business options to apply to the element
   * @returns The created shape with business options applied
   */
  createBpmnElement(type: string, options?: any, businessOptions?: BusinessOptions) {
    try {
      const shape = this._elementFactory.createShape(assign({ type }, options));
      this._logger.info('BPMN element created', {
        type,
        hasBusinessOptions: !!(businessOptions && Object.keys(businessOptions).length > 0)
      });

      // Apply business options if they exist
      if (businessOptions && Object.keys(businessOptions).length > 0) {
        this.insertBusinessOptions((key: string, value: any) => shape.businessObject.set(key, value), businessOptions);
      }

      return shape;
    } catch (error) {
      this._logger.error('Failed to create BPMN element', {
        type,
        options,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
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
    try {
      const shortType = type.replace(/^bpmn:/, '');
      const createListener = (event: any) => {
        const shape = this.createBpmnElement(type, options, businessOptions);
        this._create.start(event, shape);
      };

      this._logger.info('Palette action created', { type, group, className, title });

      return {
        group,
        className: `${className} w-8 h-8`,
        title: title || this._translate('Create {type}', { type: shortType }),
        action: {
          dragstart: createListener,
          click: createListener
        }
      };
    } catch (error) {
      this._logger.error('Failed to create palette action', {
        type,
        group,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
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
    try {
      const shortType = type.replace(/^bpmn:/, '');

      if (typeof title !== 'string') {
        this._logger.info('Title parameter is not string, using options as title source', {
          titleType: typeof title,
          hasOptions: !!options
        });
        options = title;
        title = this._translate('Append {type}', { type: shortType });
      } else {
        this._logger.info('Using provided title', { title });
      }

      // 记录翻译调用
      try {
        const translatedTitle = this._translate('Append {type}', { type: shortType });
        this._logger.info('Translation successful', { key: 'Append {type}', type: shortType, result: translatedTitle });
      } catch (error) {
        this._logger.error('Translation failed', {
          key: 'Append {type}',
          type: shortType,
          error: error instanceof Error ? error.message : String(error)
        });
      }

      const appendStart = (event: any, element: any) => {
        const startTime = Date.now();
        try {
          this._logger.info('Starting element append operation', {
            type,
            sourceElementId: element?.id,
            hasAutoPlace: !!this._autoPlace,
            hasAppendPreview: !!this._appendPreview
          });

          const shape = this.createBpmnElement(type, options, businessOptions);
          this._create.start(event, shape, { source: element });

          if (this._appendPreview) {
            this._appendPreview.cleanUp();
            this._logger.info('Append preview cleaned up');
          }

          const duration = Date.now() - startTime;
          this._logger.info('Element append completed successfully', { type, duration: `${duration}ms` });
        } catch (error) {
          const duration = Date.now() - startTime;
          this._logger.error('Element append failed', {
            type,
            sourceElementId: element?.id,
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      };

      const appendAuto = this._autoPlace ? (event: any, element: any) => {
        const startTime = Date.now();
        try {
          this._logger.info('Starting auto-place append operation', { type, sourceElementId: element?.id });

          const shape = this.createBpmnElement(type, options, businessOptions);
          this._autoPlace.append(element, shape);

          if (this._appendPreview) {
            this._appendPreview.cleanUp();
            this._logger.info('Append preview cleaned up after auto-place');
          }

          const duration = Date.now() - startTime;
          this._logger.info('Auto-place append completed', { type, duration: `${duration}ms` });
        } catch (error) {
          const duration = Date.now() - startTime;
          this._logger.error('Auto-place append failed', {
            type,
            sourceElementId: element?.id,
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      } : appendStart;

      const previewAppend = this._autoPlace ? (event: any, element: any) => {
        try {
          this._logger.info('Creating append preview', { type, elementId: element?.id });
          this._appendPreview?.create(element, type, options);

          return () => {
            this._logger.info('Cleaning up append preview', { type, elementId: element?.id });
            this._appendPreview?.cleanUp();
          };
        } catch (error) {
          this._logger.error('Preview append operation failed', {
            type,
            elementId: element?.id,
            error: error instanceof Error ? error.message : String(error)
          });
          return undefined;
        }
      } : undefined;

      this._logger.info('Context pad action created', { type, className, title });

      return {
        group: 'model',
        className: `${className} w-8 h-8`,
        title: title!,
        action: {
          dragstart: appendStart,
          click: appendAuto,
          hover: previewAppend
        }
      };
    } catch (error) {
      this._logger.error('Failed to create context pad action', {
        type,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

// Export as default module for bpmn-js integration
export default {
  __init__: ['bpmnElementFactory'],
  __depends__: [CustomLoggerModule],
  bpmnElementFactory: ['type', BpmnElementFactory]
};
