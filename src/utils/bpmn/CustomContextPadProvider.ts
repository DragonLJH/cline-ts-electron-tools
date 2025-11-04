import {
  assign,
  forEach,
  isArray,
  every,
  isFunction
} from 'min-dash';
import { hasPrimaryModifier } from 'diagram-js/lib/util/Mouse';
import GlobalConnectModule from 'diagram-js/lib/features/global-connect';

// Type definitions for better type safety
interface ContextPadEntry {
  group: string;
  className: string;
  title: string;
  action: {
    click?: (event: any, element: any) => void;
    dragstart?: (event: any, element: any) => void;
    hover?: (event: any, element: any) => (() => void) | undefined;
  };
}

interface ContextPadEntries {
  [key: string]: ContextPadEntry;
}

interface ContextPadConfig {
  autoPlace?: boolean;
  [key: string]: any;
}

interface Element {
  type: string;
  businessObject?: any;
  [key: string]: any;
}

interface BusinessOptions {
  [key: string]: any;
}

interface ContextPadPosition {
  x: number;
  y: number;
  cursor?: {
    x: number;
    y: number;
  };
}

interface ReplaceMenuConfig {
  title: string;
  width: number;
  search: boolean;
}

/**
 * Utility function to check if array includes element
 */
function includes<T>(array: T[], item: T): boolean {
  return array.indexOf(item) !== -1;
}

/**
 * Custom Context Pad Provider for BPMN.js
 * Provides element-specific context menu entries and toolbars with TypeScript support
 */
export class CustomContextPadProviderModule {
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

  /** Dependency injection array */
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

    contextPad.registerProvider(this);

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

    if (config.autoPlace !== false) {
      this._autoPlace = injector.get('autoPlace', false);
    }

    console.log('[contextPad]', contextPad, this._autoPlace, popupMenu);

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

    eventBus.on('root.updateBusiness', (eventDetail: any) => {
      console.log('CustomContextPadProviderModule[root.updateBusiness]', eventDetail);
      const { type, ...businessObject } = eventDetail;
      this._businessCustomOptions = {
        ...this._businessCustomOptions,
        ...businessObject
      };
      contextPad._init();
    });
  }

  /**
   * Get context pad entries for multiple selected elements
   */
  public getMultiElementContextPadEntries(elements: Element[]): ContextPadEntries {
    const modeling = this._modeling;
    const actions: ContextPadEntries = {};

    if (this._isDeleteAllowed(elements)) {
      assign(actions, {
        'delete': {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: this._translate('Remove'),
          action: {
            click: (_event: any, elements: Element[]) => {
              modeling.removeElements(elements.slice());
            }
          }
        }
      });
    }

    return actions;
  }

  /**
   * Check if deleting elements is allowed
   */
  private _isDeleteAllowed(elements: Element[]): boolean {
    const baseAllowed = this._rules.allowed('elements.delete', {
      elements: elements
    });

    if (isArray(baseAllowed)) {
      return every(baseAllowed, (element: any) => {
        return includes(baseAllowed, element);
      });
    }

    return baseAllowed;
  }

  /**
   * Get context pad entries for a specific element
   */
  public getContextPadEntries(element: Element): ContextPadEntries {
    const contextPad = this._contextPad;
    const modeling = this._modeling;
    const elementFactory = this._elementFactory;
    const connect = this._connect;
    const create = this._create;
    const popupMenu = this._popupMenu;
    const rules = this._rules;
    const autoPlace = this._autoPlace;
    const translate = this._translate;
    const appendPreview = this._appendPreview;
    const businessCustomOptions = this._businessCustomOptions;
    const { type } = element;

    const actions: ContextPadEntries = {};

    // Don't show context pad for labels
    if (element.type === 'label') {
      return actions;
    }

    /**
     * Remove element action
     */
    const removeElement = (_event: any, element: Element) => {
      modeling.removeElements([element]);
    };

    /**
     * Start connection action
     */
    const startConnect = (event: any, element: Element) => {
      connect.start(event, element);
    };

    /**
     * Apply business options to a shape
     */
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

    /**
     * Create an append action
     */
    const appendAction = (
      type: string,
      className: string,
      title?: string,
      options?: any
    ): ContextPadEntry => {
      const shortType = type.replace(/^bpmn:/, '');

      if (typeof title !== 'string') {
        options = title;
        title = translate('Append {type}', { type: shortType });
      }

      /**
       * Start append operation
       */
      const appendStart = (event: any, element: Element) => {
        const shape = elementFactory.createShape(assign({ type }, options));
        console.log('[appendStart]shortType', shortType, businessCustomOptions);

        if (businessCustomOptions && Object.keys(businessCustomOptions).length > 0) {
          insertBusinessOptions((key: string, value: any) => shape.businessObject.set(key, value), businessCustomOptions);
        }

        create.start(event, shape, { source: element });
        appendPreview.cleanUp();
      };

      /**
       * Auto append if available
       */
      const appendAuto = autoPlace ? (_event: any, element: Element) => {
        const shape = elementFactory.createShape(assign({ type }, options));

        console.log('[append]shortType', shortType, businessCustomOptions);
        if (businessCustomOptions && Object.keys(businessCustomOptions).length > 0) {
          insertBusinessOptions((key: string, value: any) => shape.businessObject.set(key, value), businessCustomOptions);
        }

        autoPlace.append(element, shape);
        appendPreview.cleanUp();
      } : appendStart;

      /**
       * Preview append on hover
       */
      const previewAppend = autoPlace ? (_event: any, element: Element) => {
        // mouseover
        appendPreview.create(element, type, options);

        return () => {
          // mouseout
          appendPreview.cleanUp();
        };
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

    /**
     * Get position for replace menu
     */
    const getReplaceMenuPosition = (element: Element): ContextPadPosition => {
      const Y_OFFSET = 5;
      const pad = contextPad.getPad(element).html;
      const padRect = pad.getBoundingClientRect();

      return {
        x: padRect.left,
        y: padRect.bottom + Y_OFFSET
      };
    };

    // Add replace menu entry
    assign(actions, {
      'replace': {
        group: 'edit',
        className: 'bpmn-icon-screw-wrench',
        title: translate('Change type'),
        action: {
          click: (event: any, element: Element) => {
            const position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });

            const config: ReplaceMenuConfig = {
              title: translate('Change element'),
              width: 300,
              search: true
            };

            popupMenu.open(element, 'bpmn-replace', position, config);
          }
        }
      }
    });

    // Add append actions
    assign(actions, {
      'append.end-event': appendAction(
        'bpmn:EndEvent',
        'bpmn-icon-end-event-none',
        translate('Append EndEvent')
      ),
      'append.gateway': appendAction(
        'bpmn:ExclusiveGateway',
        'bpmn-icon-gateway-none',
        translate('Append Gateway')
      ),
      'append.exclusive-gateway': appendAction(
        'bpmn:ExclusiveGateway',
        'bpmn-icon-gateway-xor',
        translate('Append ExclusiveGateway')
      ),
      'append.parallel-gateway': appendAction(
        'bpmn:ParallelGateway',
        'bpmn-icon-gateway-parallel',
        translate('Append ParallelGateway')
      ),
      'append.append-task': appendAction(
        'bpmn:UserTask',
        'bpmn-icon-user-task',
        translate('Append UserTask')
      ),
      'append.receive-task': appendAction(
        'bpmn:ReceiveTask',
        'bpmn-icon-receive-task',
        translate('Append ReceiveTask')
      ),
    });

    // Add utility actions
    assign(actions, {
      'delete': {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: translate('Remove'),
        action: { click: removeElement }
      },
      'connect': {
        group: 'connect',
        className: 'bpmn-icon-connection-multi',
        title: translate('Connect using Association'),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });

    /**
     * Filter actions based on allowed actions for element type
     */
    const actionsFilter = (filterList: string[], targetObject: ContextPadEntries, result: ContextPadEntries = {}): ContextPadEntries => {
      filterList.forEach(item => {
        if (targetObject[item]) {
          result[item] = targetObject[item];
        }
      });
      return result;
    };

    // Define allowed actions for each element type
    const commonActions = ["connect", "delete"];
    const addPrefix = (list: string[], prefix = "append.") => list.map(item => prefix + item);

    const elementActionMap: Record<string, string[]> = {
      "bpmn:StartEvent": [...addPrefix(["append-task", "end-event", "exclusive-gateway", "parallel-gateway"]), ...commonActions],
      "bpmn:UserTask": [...addPrefix(["append-task", "end-event", "exclusive-gateway", "parallel-gateway"]), ...commonActions],
      "bpmn:ExclusiveGateway": [...addPrefix(["append-task", "end-event"]), ...commonActions],
      "bpmn:ParallelGateway": [...addPrefix(["append-task", "end-event"]), ...commonActions],
      "bpmn:EndEvent": [...commonActions],
      "bpmn:SequenceFlow": ["delete"],
    };

    // Return filtered actions based on element type
    return Object.prototype.hasOwnProperty.call(elementActionMap, type)
      ? actionsFilter(elementActionMap[type], actions)
      : actions;
  }
}

// Default export for the module
export default {
  __init__: [
    'contextPadProvider',
  ],
  __depends__: [GlobalConnectModule],

  contextPadProvider: ['type', CustomContextPadProviderModule]
};
