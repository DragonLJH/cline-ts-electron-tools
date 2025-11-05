/**
 * Standalone Context Pad Provider Implementation
 *
 * This is an independent implementation that manually manages all ContextPadProvider
 * functionality without inheriting from the base class. This approach provides
 * maximum control and customization flexibility.
 */

import { assign, every, isArray } from 'min-dash';
import { hasPrimaryModifier } from 'diagram-js/lib/util/Mouse';

// Type definitions for better type safety
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

/**
 * Utility function to check if array includes element
 */
function includes<T>(array: T[], item: T): boolean {
  return array.indexOf(item) !== -1;
}

/**
 * Standalone Context Pad Provider
 *
 * Complete custom implementation without inheritance, offering full control
 * over context menu behavior and appearance.
 */
export class StandaloneContextPadProvider {
  private _contextPad: any;
  private _modeling: any;
  private _elementFactory: any;
  private _connect: any;
  private _create: any;
  private _popupMenu: any;
  private _canvas: any;
  private _rules: any;
  private _translate: (key: string, options?: Record<string, any>) => string;
  private _eventBus: any;
  private _appendPreview: any;
  private _autoPlace: any;
  private _businessCustomOptions: BusinessOptions = {};

  /** Dependency injection array for bpmn-js module system */
  public static $inject: string[] = [
    'config.contextPad',
    'injector',
    'eventBus',
    'contextPad',
    'modeling',
    'elementFactory',
    'connect',
    'create',
    'popupMenu',
    'canvas',
    'rules',
    'translate',
    'appendPreview'
  ];

  constructor(
    config: ContextPadConfig,
    injector: any,
    eventBus: any,
    contextPad: any,
    modeling: any,
    elementFactory: any,
    connect: any,
    create: any,
    popupMenu: any,
    canvas: any,
    rules: any,
    translate: (key: string, options?: Record<string, any>) => string,
    appendPreview: any
  ) {
    config = config || {};

    // Register this provider with the context pad
    contextPad.registerProvider(this);

    // Store all dependencies
    this._contextPad = contextPad;
    this._modeling = modeling;
    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._popupMenu = popupMenu;
    this._canvas = canvas;
    this._rules = rules;
    this._translate = translate;
    this._eventBus = eventBus;
    this._appendPreview = appendPreview;

    // Configure auto-place
    if (config.autoPlace !== false) {
      this._autoPlace = injector.get('autoPlace', false);
    }

    console.log('[StandaloneContextPadProvider] Initialized with full control');
    console.log('ContextPad:', contextPad, 'AutoPlace:', this._autoPlace, 'PopupMenu:', popupMenu);

    // Handle create.end event for enhanced UX
    eventBus.on('create.end', 250, (event: any) => {
      const context = event.context;
      const shape = context.shape;

      if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
        return;
      }

      const entries = contextPad.getEntries(shape);
      if (entries.replace) {
        entries.replace.action.click!(event, shape);
      }
    });

    // Listen for business configuration updates
    eventBus.on('root.updateBusiness', (eventDetail: any) => {
      console.log('[StandaloneProvider] Business update received:', eventDetail);
      const { type, ...businessObject } = eventDetail;
      this._businessCustomOptions = {
        ...this._businessCustomOptions,
        ...businessObject
      };
      // Refresh the context pad to show updated entries
      contextPad._init();
    });
  }

  /**
   * Get context pad entries for multiple selected elements
   * @param elements - Array of selected elements
   * @returns Context pad entries for multi-element operations
   */
  public getMultiElementContextPadEntries(elements: Element[]): ContextPadEntries {
    const actions: ContextPadEntries = {};

    if (this._isDeleteAllowed(elements)) {
      assign(actions, {
        'delete': {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: this._translate('Remove'),
          action: {
            click: (_event: any, elements: Element[]) => {
              this._modeling.removeElements(elements.slice());
            }
          }
        }
      });
    }

    return actions;
  }

  /**
   * Check if deleting the given elements is allowed
   * @param elements - Elements to check deletion permissions for
   * @returns Whether deletion is allowed for all elements
   */
  private _isDeleteAllowed(elements: Element[]): boolean {
    const baseAllowed = this._rules.allowed('elements.delete', { elements });

    if (isArray(baseAllowed)) {
      return every(baseAllowed, (element: any) => includes(baseAllowed, element));
    }

    return baseAllowed;
  }

  /**
   * Get context pad entries for a specific element
   * This is the main method that determines what actions are available for each element
   * @param element - The BPMN element to get context pad entries for
   * @returns Context pad entries customized for the element type
   */
  public getContextPadEntries(element: Element): ContextPadEntries {
    const actions: ContextPadEntries = {};

    // Don't show context pad for labels
    if (element.type === 'label') {
      return actions;
    }

    // Utility functions
    const removeElement = (_event: any, element: Element) => {
      this._modeling.removeElements([element]);
    };

    const startConnect = (event: any, element: Element) => {
      this._connect.start(event, element);
    };

    const insertBusinessOptions = (setFn: (key: string, value: any) => void, options: BusinessOptions) => {
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
    };

    // Generate append actions for different BPMN element types
    const appendAction = (
      type: string,
      className: string,
      title?: string,
      options?: any
    ): ContextPadEntry => {
      const shortType = type.replace(/^bpmn:/, '');

      if (typeof title !== 'string') {
        options = title;
        title = this._translate('Append {type}', { type: shortType });
      }

      const appendStart = (event: any, element: Element) => {
        const shape = this._elementFactory.createShape(assign({ type }, options));

        // Apply business options if they exist
        if (this._businessCustomOptions && Object.keys(this._businessCustomOptions).length > 0) {
          insertBusinessOptions((key: string, value: any) => shape.businessObject.set(key, value), this._businessCustomOptions);
        }

        this._create.start(event, shape, { source: element });
        this._appendPreview.cleanUp();
      };

      const appendAuto = this._autoPlace ? (_event: any, element: Element) => {
        const shape = this._elementFactory.createShape(assign({ type }, options));

        if (this._businessCustomOptions && Object.keys(this._businessCustomOptions).length > 0) {
          insertBusinessOptions((key: string, value: any) => shape.businessObject.set(key, value), this._businessCustomOptions);
        }

        this._autoPlace.append(element, shape);
        this._appendPreview.cleanUp();
      } : appendStart;

      const previewAppend = this._autoPlace ? (_event: any, element: Element) => {
        this._appendPreview.create(element, type, options);
        return () => this._appendPreview.cleanUp();
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
    };

    // Define standard actions available for all elements
    assign(actions, {
      'append.end-event': appendAction(
        'bpmn:EndEvent',
        'bpmn-icon-end-event-none',
        this._translate('Append EndEvent')
      ),
      'append.gateway': appendAction(
        'bpmn:ExclusiveGateway',
        'bpmn-icon-gateway-none',
        this._translate('Append Gateway')
      ),
      'append.append-task': appendAction(
        'bpmn:Task',
        'bpmn-icon-task',
        this._translate('Append Task')
      ),
    });

    // Define edit actions (delete, connect, etc.)
    assign(actions, {
      'delete': {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: this._translate('Remove'),
        action: { click: removeElement }
      },
      'connect': {
        group: 'connect',
        className: 'bpmn-icon-connection-multi',
        title: this._translate('Connect using Association'),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });

    // Filter actions based on element type
    return this._filterActionsByElementType(element.type, actions);
  }

  /**
   * Filter context pad actions based on BPMN element type
   * Different element types should show different available actions
   * @param elementType - The BPMN element type (e.g., 'bpmn:StartEvent')
   * @param allActions - All possible actions
   * @returns Filtered actions appropriate for the element type
   */
  private _filterActionsByElementType(elementType: string, allActions: ContextPadEntries): ContextPadEntries {
    const actionsFilter = (filterList: string[], targetObject: ContextPadEntries): ContextPadEntries => {
      const result: ContextPadEntries = {};
      filterList.forEach(item => {
        if (targetObject[item]) {
          result[item] = targetObject[item];
        }
      });
      return result;
    };

    // Define which actions are available for each element type
    const commonActions = ["connect", "delete"];
    const addPrefix = (list: string[], prefix = "append.") => list.map(item => prefix + item);

    // Element-specific action mapping
    const elementActionMap: Record<string, string[]> = {
      "bpmn:StartEvent": [...addPrefix(["append-task", "end-event", "gateway"]), ...commonActions],
      "bpmn:UserTask": [...addPrefix(["append-task", "end-event", "gateway"]), ...commonActions],
      "bpmn:ExclusiveGateway": [...addPrefix(["append-task", "end-event"]), ...commonActions],
      "bpmn:EndEvent": [...commonActions],
      "bpmn:SequenceFlow": ["delete"],
    };

    return Object.prototype.hasOwnProperty.call(elementActionMap, elementType)
      ? actionsFilter(elementActionMap[elementType], allActions)
      : allActions;
  }
}

// Export as default module for bpmn-js integration
export default StandaloneContextPadProvider;
