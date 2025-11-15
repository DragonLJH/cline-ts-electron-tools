/**
 * Custom Popup Menu Provider Implementation
 *
 * This provider implements the PopupMenuProvider interface to create
 * custom popup menus for BPMN elements with enhanced functionality.
 */

import PopupMenuProvider, {
  PopupMenuEntries,
  PopupMenuEntry,
  PopupMenuHeaderEntries,
  PopupMenuHeaderEntry,
  PopupMenuEmptyPlaceholder
} from 'diagram-js/lib/features/popup-menu/PopupMenuProvider';
import type { PopupMenuTarget, Element } from 'diagram-js/lib/features/popup-menu/PopupMenu';
import { CustomLoggerService } from '../CustomLoggerService/CustomLoggerService';
import CustomLoggerModule from '../CustomLoggerService/CustomLoggerService';
import BpmnElementFactoryModule from '../../utils/bpmnElementFactory';
import type { BusinessOptions, BpmnElementFactory } from '../../utils/bpmnElementFactory';

/**
 * Custom Popup Menu Provider
 *
 * Provides popup menu entries for BPMN elements with custom actions
 * and enhanced user experience features.
 */
export class CustomPopupMenuProvider implements PopupMenuProvider {
  private _logger: CustomLoggerService;
  private _bpmnElementFactory: BpmnElementFactory;
  private _businessCustomOptions: BusinessOptions = {};

  /** Dependency injection array for bpmn-js module system */
  public static $inject: string[] = [
    'customLogger',
    'bpmnElementFactory'
  ];

  constructor(
    customLogger: CustomLoggerService,
    bpmnElementFactory: BpmnElementFactory
  ) {
    this._logger = customLogger;
    this._bpmnElementFactory = bpmnElementFactory;

    this._logger.info('CustomPopupMenuProvider initialized');
  }

  /**
   * Update business configuration options
   * @param options - Business configuration options
   */
  public updateBusinessOptions(options: BusinessOptions): void {
    this._businessCustomOptions = { ...this._businessCustomOptions, ...options };
    this._logger.debug('Business options updated', options);
  }

  /**
   * Get popup menu entries for the given target element
   *
   * @param target - The element for which to get popup menu entries
   * @returns Popup menu entries or a function to modify existing entries
   */
  public getPopupMenuEntries(target: PopupMenuTarget): PopupMenuEntries {
    // Handle array target (multiple elements selected)
    if (Array.isArray(target)) {
      return this._getMultiElementEntries(target);
    }

    // Handle single element target
    this._logger.debug('Getting popup menu entries for target', { targetType: target.type, targetId: target.id });

    const entries: PopupMenuEntries = {};

    // Don't show popup menu for labels
    if (target.type === 'label') {
      return entries;
    }

    // Add element-specific entries based on BPMN element type
    this._addElementSpecificEntries(target, entries);

    // Add common entries for all elements
    this._addCommonEntries(target, entries);

    return entries;
  }

  /**
   * Get header entries for the popup menu
   *
   * @param target - The element for which to get header entries
   * @returns Header entries for the popup menu
   */
  public getPopupMenuHeaderEntries?(target: PopupMenuTarget): PopupMenuHeaderEntries {
    const headerEntries: PopupMenuHeaderEntries = [];

    // Handle array target (multiple elements selected)
    if (Array.isArray(target)) {
      headerEntries.push({
        id: 'multi-element-info',
        title: `Multiple Elements (${target.length})`,
        className: 'multi-element-header',
        action: (event: Event, entry: PopupMenuHeaderEntry) => {
          this._logger.info('Multi-element header clicked', { elementCount: target.length });
        }
      });
      return headerEntries;
    }

    // Add header entries based on element type
    if (target.type?.startsWith('bpmn:')) {
      headerEntries.push({
        id: 'element-info',
        title: `Element: ${target.type.replace('bpmn:', '')}`,
        className: 'element-info-header',
        action: (event: Event, entry: PopupMenuHeaderEntry) => {
          this._logger.info('Header entry clicked', { entryId: entry.id, targetId: target.id });
        }
      });
    }

    return headerEntries;
  }

  /**
   * Get entries for multiple selected elements
   *
   * @param elements - Array of selected elements
   * @returns Popup menu entries for multi-element operations
   */
  private _getMultiElementEntries(elements: Element[]): PopupMenuEntries {
    const entries: PopupMenuEntries = {};

    // Add delete action for multiple elements
    entries['multi-delete'] = {
      label: `Delete ${elements.length} Elements`,
      className: 'bpmn-icon-trash',
      group: 'edit',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Multi-element delete clicked', { elementCount: elements.length });
        // TODO: Implement multi-element delete functionality
      }
    };

    // Add copy action for multiple elements
    entries['multi-copy'] = {
      label: `Copy ${elements.length} Elements`,
      className: 'bpmn-icon-copy',
      group: 'edit',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Multi-element copy clicked', { elementCount: elements.length });
        // TODO: Implement multi-element copy functionality
      }
    };

    return entries;
  }



  /**
   * Add element-specific entries based on BPMN element type
   *
   * @param target - Target element (guaranteed to be single element)
   * @param entries - Entries object to populate
   */
  private _addElementSpecificEntries(target: Element, entries: PopupMenuEntries): void {
    const elementType = target.type;

    switch (elementType) {
      case 'bpmn:StartEvent':
        this._addStartEventEntries(target, entries);
        break;
      case 'bpmn:UserTask':
        this._addUserTaskEntries(target, entries);
        break;
      case 'bpmn:ExclusiveGateway':
        this._addGatewayEntries(target, entries);
        break;
      case 'bpmn:EndEvent':
        this._addEndEventEntries(target, entries);
        break;
      case 'bpmn:SequenceFlow':
        this._addSequenceFlowEntries(target, entries);
        break;
      default:
        this._addDefaultEntries(target, entries);
        break;
    }
  }

  /**
   * Add entries specific to Start Events
   */
  private _addStartEventEntries(target: Element, entries: PopupMenuEntries): void {
    entries['start-properties'] = {
      label: 'Edit Properties',
      className: 'bpmn-icon-properties',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Start Event properties clicked', { targetId: target.id });
        // TODO: Open properties panel
      }
    };

    entries['start-validation'] = {
      label: 'Validate Element',
      className: 'bpmn-icon-validation',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Start Event validation clicked', { targetId: target.id });
        // TODO: Run validation
      }
    };
  }

  /**
   * Add entries specific to User Tasks
   */
  private _addUserTaskEntries(target: Element, entries: PopupMenuEntries): void {
    entries['task-assign'] = {
      label: 'Assign User',
      className: 'bpmn-icon-user',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('User Task assign clicked', { targetId: target.id });
        // TODO: Open user assignment dialog
      }
    };

    entries['task-properties'] = {
      label: 'Task Properties',
      className: 'bpmn-icon-properties',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('User Task properties clicked', { targetId: target.id });
        // TODO: Open properties panel
      }
    };
  }

  /**
   * Add entries specific to Gateways
   */
  private _addGatewayEntries(target: Element, entries: PopupMenuEntries): void {
    entries['gateway-conditions'] = {
      label: 'Edit Conditions',
      className: 'bpmn-icon-condition',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Gateway conditions clicked', { targetId: target.id });
        // TODO: Open conditions editor
      }
    };
  }

  /**
   * Add entries specific to End Events
   */
  private _addEndEventEntries(target: Element, entries: PopupMenuEntries): void {
    entries['end-properties'] = {
      label: 'End Event Properties',
      className: 'bpmn-icon-properties',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('End Event properties clicked', { targetId: target.id });
        // TODO: Open properties panel
      }
    };
  }

  /**
   * Add entries specific to Sequence Flows
   */
  private _addSequenceFlowEntries(target: Element, entries: PopupMenuEntries): void {
    entries['flow-properties'] = {
      label: 'Flow Properties',
      className: 'bpmn-icon-properties',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Sequence Flow properties clicked', { targetId: target.id });
        // TODO: Open properties panel
      }
    };

    entries['flow-condition'] = {
      label: 'Edit Condition',
      className: 'bpmn-icon-condition',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Sequence Flow condition clicked', { targetId: target.id });
        // TODO: Open condition editor
      }
    };
  }

  /**
   * Add default entries for unsupported element types
   */
  private _addDefaultEntries(target: Element, entries: PopupMenuEntries): void {
    entries['default-properties'] = {
      label: 'Properties',
      className: 'bpmn-icon-properties',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Default properties clicked', { targetId: target.id, targetType: target.type });
        // TODO: Open generic properties panel
      }
    };
  }

  /**
   * Add common entries available for all elements
   */
  private _addCommonEntries(target: Element, entries: PopupMenuEntries): void {
    entries['common-info'] = {
      label: 'Element Info',
      className: 'bpmn-icon-info',
      group: 'info',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Element info clicked', {
          targetId: target.id,
          targetType: target.type,
          businessObject: target.businessObject
        });
        // TODO: Show element information dialog
      }
    };

    entries['common-copy'] = {
      label: 'Copy Element',
      className: 'bpmn-icon-copy',
      group: 'edit',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Copy element clicked', { targetId: target.id });
        // TODO: Implement copy functionality
      }
    };

    entries['common-delete'] = {
      label: 'Delete Element',
      className: 'bpmn-icon-trash',
      group: 'edit',
      action: (event: Event, entry: PopupMenuEntry) => {
        this._logger.info('Delete element clicked', { targetId: target.id });
        // TODO: Implement delete functionality
      }
    };
  }
}

// Export as default module for bpmn-js integration
export default {
  __init__: ['customPopupMenuProvider'],
  __depends__: [CustomLoggerModule, BpmnElementFactoryModule],
  customPopupMenuProvider: ['type', CustomPopupMenuProvider]
};
