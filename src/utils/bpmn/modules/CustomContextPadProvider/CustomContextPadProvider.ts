/**
 * Custom Context Pad Provider Implementation
 *
 * This is an independent implementation that manually manages all ContextPadProvider
 * functionality without inheriting from the base class. This approach provides
 * maximum control and customization flexibility.
 */

import { assign, every, isArray } from 'min-dash';
import { hasPrimaryModifier } from 'diagram-js/lib/util/Mouse';
import { CustomLoggerService } from '../CustomLoggerService/CustomLoggerService';
import CustomLoggerModule from '../CustomLoggerService/CustomLoggerService';
import { CustomPopupMenuProvider } from '../CustomPopupMenuProvider/CustomPopupMenuProvider';
import CustomPopupMenuModule from '../CustomPopupMenuProvider/CustomPopupMenuProvider';
import BpmnElementFactoryModule from '../../utils/bpmnElementFactory';
import type { BusinessOptions, BpmnElementFactory } from '../../utils/bpmnElementFactory';

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



/**
 * Utility function to check if array includes element
 */
function includes<T>(array: T[], item: T): boolean {
  return array.indexOf(item) !== -1;
}

/**
 * Custom Context Pad Provider
 *
 * Complete custom implementation without inheritance, offering full control
 * over context menu behavior and appearance.
 */
export class CustomContextPadProvider {
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
  private _logger: CustomLoggerService;
  private _bpmnElementFactory: BpmnElementFactory;

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
    'appendPreview',
    'customLogger',
    'bpmnElementFactory'
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
    appendPreview: any,
    customLogger: CustomLoggerService,
    bpmnElementFactory: BpmnElementFactory
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
    this._logger = customLogger;
    this._bpmnElementFactory = bpmnElementFactory;

    // Configure auto-place
    if (config.autoPlace !== false) {
      this._autoPlace = injector.get('autoPlace', false);
    }

    this._logger.info('CustomContextPadProvider initialized with full control');
    this._logger.debug('ContextPad configuration', { contextPad, autoPlace: this._autoPlace, popupMenu });

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
      this._logger.info('Business update received', eventDetail);
      const { type, ...businessObject } = eventDetail;
      this._businessCustomOptions = {
        ...this._businessCustomOptions,
        ...businessObject
      };
      // Refresh the context pad to show updated entries
      contextPad._init();
    });

    // Register custom popup menu provider with the popup menu
    if (popupMenu) {
      popupMenu.registerProvider('custom-popup-menu', this._createPopupMenuProvider());
      this._logger.info('Custom popup menu provider registered');
    }

    // Handle right-click context menu for elements
    eventBus.on('element.contextmenu', (event: any) => {
      const { element, originalEvent } = event;

      // Prevent default browser context menu
      originalEvent.preventDefault();
      originalEvent.stopPropagation();

      // Show custom popup menu
      this._showPopupMenu(element, originalEvent);
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



    // Generate append actions for different BPMN element types
    const appendAction = (
      type: string,
      className: string,
      title?: string,
      options?: any
    ): ContextPadEntry => {
      return this._bpmnElementFactory.createContextPadAction(
        type,
        className,
        title,
        options,
        this._businessCustomOptions
      );
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
      'append.append-userTask': appendAction(
        'bpmn:UserTask',
        'bpmn-icon-user-task',
        this._translate('Append UserTask')
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
      "bpmn:StartEvent": [...addPrefix(["append-userTask", "end-event", "gateway"]), ...commonActions],
      "bpmn:UserTask": [...addPrefix(["append-userTask", "end-event", "gateway"]), ...commonActions],
      "bpmn:ExclusiveGateway": [...addPrefix(["append-userTask", "end-event"]), ...commonActions],
      "bpmn:EndEvent": [...commonActions],
      "bpmn:SequenceFlow": ["delete"],
    };

    return Object.prototype.hasOwnProperty.call(elementActionMap, elementType)
      ? actionsFilter(elementActionMap[elementType], allActions)
      : allActions;
  }

  /**
   * Create a popup menu provider instance
   * @returns Custom popup menu provider instance
   */
  private _createPopupMenuProvider(): CustomPopupMenuProvider {
    return new CustomPopupMenuProvider(this._logger, this._bpmnElementFactory);
  }

  /**
   * Show popup menu for the given element at the specified position
   * @param element - The element to show popup menu for
   * @param event - The mouse event that triggered the popup
   */
  private _showPopupMenu(element: Element, event: MouseEvent): void {
    if (!this._popupMenu) {
      this._logger.warn('Popup menu not available');
      return;
    }

    const position = {
      x: event.clientX,
      y: event.clientY
    };

    try {
      this._popupMenu.open(element, 'custom-popup-menu', position);
      this._logger.debug('Popup menu opened for element', { elementId: element.id, position });
    } catch (error) {
      this._logger.error('Failed to open popup menu', error);
    }
  }
}

// Export as default module for bpmn-js integration
export default {
    __init__: ['contextPadProvider'],
    __depends__: [CustomLoggerModule, BpmnElementFactoryModule, CustomPopupMenuModule],
    contextPadProvider: ['type', CustomContextPadProvider]
};
