/**
 * Inheritance Pattern Example - BPMN Context Pad Provider
 *
 * This file demonstrates the INHERITANCE PATTERN for implementing a BPMN ContextPadProvider.
 * It shows how to properly inherit from a base class and override methods.
 *
 * Note: This is an EDUCATIONAL example showing inheritance concepts.
 * For production use, we recommend the StandaloneProvider approach.
 */

import { assign } from 'min-dash';

// Base ContextPadProvider interface (simplified for demonstration)
interface BaseContextPadProvider {
  getContextPadEntries(element: any): any;
  getMultiElementContextPadEntries(elements: any[]): any;
}

// Simulated base class (representing bpmn-js ContextPadProvider)
class BaseContextPadProvider implements BaseContextPadProvider {
  protected _contextPad: any;
  protected _modeling: any;
  protected _elementFactory: any;
  protected _connect: any;
  protected _create: any;
  protected _rules: any;
  protected _translate: any;

  constructor(
    config: any,
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
    translate: any,
    appendPreview: any
  ) {
    // Store services that would be available in real inheritance
    this._contextPad = contextPad;
    this._modeling = modeling;
    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._rules = rules;
    this._translate = translate;

    console.log('[BaseContextPadProvider] Initialized');
  }

  // Simulated base method that returns default entries
  getContextPadEntries(element: any): any {
    return {
      'base.delete': {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: 'Base: Delete',
        action: {
          click: (event: any, el: any) => {
            console.log('[Base] Deleting element:', el.type);
          }
        }
      }
    };
  }

  // Simulated base method for multi-element operations
  getMultiElementContextPadEntries(elements: any[]): any {
    return {
      'base.multi-delete': {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: 'Base: Delete Multiple',
        action: {
          click: (event: any, elements: any[]) => {
            console.log('[Base] Deleting multiple elements:', elements.length);
          }
        }
      }
    };
  }
}

/**
 * INHERITED ContextPadProvider
 *
 * This class demonstrates TRUE inheritance by:
 * - EXTENDING the base ContextPadProvider class
 * - OVERRIDING virtual methods to customize behavior
 * - CALLING super() for initialization
 * - ACCESSING protected or public base class methods
 * - MERGING custom entries with base entries
 */
export class InheritedContextPadProvider extends BaseContextPadProvider {
  private _businessCustomOptions: any = {};

  constructor(
    config: any,
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
    translate: any,
    appendPreview: any
  ) {
    // 🔥 REQUIRED: Call parent constructor FIRST
    // This initializes all base ContextPadProvider functionality
    super(config, injector, eventBus, contextPad, modeling, elementFactory, connect, create, popupMenu, canvas, rules, translate, appendPreview);

    // Now we can access 'this' and do additional setup
    console.log('[InheritedContextPadProvider] TRUE inheritance initialized');

    // Add custom event handling (common pattern in inheritance)
    eventBus.on('inheritance.customEvent', (eventDetail: any) => {
      console.log('[Inheritance] Received custom event:', eventDetail);
    });

    eventBus.on('root.updateBusiness', (eventDetail: any) => {
      console.log('[Inheritance] Business update:', eventDetail);
      this._businessCustomOptions = {
        ...this._businessCustomOptions,
        ...eventDetail
      };
      // Refresh context pad to show updated entries
      contextPad._init();
    });
  }

  /**
   * 🔥 OVERRIDE: getContextPadEntries
   *
   * This demonstrates the key inheritance pattern:
   * 1. super.getContextPadEntries() - Call parent method to get ALL base functionality
   * 2. Add custom entries
   * 3. Return merged entries (base + custom = complete solution)
   */
  public getContextPadEntries(element: any): any {
    console.log('[Inheritance] Getting context pad entries for:', element.type);

    // 🔥 CRITICAL: Call parent method to get ALL base functionality
    const baseEntries = super.getContextPadEntries(element);

    // Skip custom entries for labels
    if (element.type === 'label') {
      return baseEntries; // Return only base entries
    }

    // Create custom entries to ADD to base functionality
    const customEntries: any = {};

    // Add inheritance-enhanced features based on element type
    this.addInheritedEnhancements(element, customEntries);

    // 🔥 KEY RESULT: Return merged entries
    // This gives you: BASE + CUSTOM = COMPLETE ENHANCED FUNCTIONALITY
    return assign({}, baseEntries, customEntries);
  }

  /**
   * 🔥 OVERRIDE: getMultiElementContextPadEntries
   *
   * Shows how inheritance allows customizing multi-element operations.
   */
  public getMultiElementContextPadEntries(elements: any[]): any {
    console.log('[Inheritance] Getting multi-element entries for', elements.length, 'elements');

    // Get base multi-element functionality
    const baseEntries = super.getMultiElementContextPadEntries(elements);

    // Add custom multi-element operations
    const customEntries: any = {};

    // Enhanced multi-element actions
    if (elements.length > 2) {
      customEntries['inheritance.bulk-process'] = {
        group: 'model',
        className: 'bpmn-icon-subprocess-expanded',
        title: 'Inheritance: Bulk Create Subprocesses',
        action: {
          click: (event: any, elements: any[]) => {
            console.log(`[Inheritance] Processing bulk ${elements.length} elements`);
            // Custom bulk processing logic here
          }
        }
      };
    }

    if (elements.length >= 3) {
      customEntries['inheritance.bulk-delete-confirmation'] = {
        group: 'edit',
        className: 'bpmn-icon-wrench',
        title: 'Inheritance: Bulk Delete with Confirmation',
        action: {
          click: (event: any, elements: any[]) => {
            const confirmed = window.confirm(`Really delete ${elements.length} elements?`);
            if (confirmed) {
              console.log('[Inheritance] Deleting elements with confirmation');
              // In real inheritance, you'd call:
              // this._modeling.removeElements(elements);
            } else {
              console.log('[Inheritance] Bulk delete cancelled');
            }
          }
        }
      };
    }

    return assign({}, baseEntries, customEntries);
  }

  /**
   * Adds inheritance-specific enhancements
   *
   * This method demonstrates accessing inherited properties and methods
   * while adding custom domain-specific functionality.
   */
  private addInheritedEnhancements(element: any, entries: any): void {
    const { type } = element;

    console.log(`[Inheritance] Adding enhancements for ${type}`);

    // Access inherited services to create elements (would work in real inheritance)
    const { _elementFactory, _create, _modeling } = this;

    // Enhanced Parallel Gateway - combined inherited functionality with custom logic
    if (['bpmn:StartEvent', 'bpmn:UserTask', 'bpmn:ExclusiveGateway'].includes(type)) {
      entries['inheritance.enhanced-parallel-gateway'] = {
        group: 'model',
        className: 'bpmn-icon-gateway-parallel',
        title: 'Inheritance: Enhanced Parallel Gateway',
        action: {
          click: (event: any, element: any) => {
            console.log('[Inheritance] Creating enhanced parallel gateway');
            console.log('- Using inherited _elementFactory:', !!_elementFactory);
            console.log('- Using inherited _create:', !!_create);
            console.log('- Business options:', this._businessCustomOptions);

            // In real inheritance with bpmn-js, you would:
            // const shape = _elementFactory.createShape({ type: 'bpmn:ParallelGateway' });
            // _create.start(event, shape, { source: element });

            // For this demo, show the individual steps:
            console.log('Step 1: _elementFactory.createShape() -> create gateway shape');
            console.log('Step 2: Apply business options ->', this._businessCustomOptions);
            console.log('Step 3: _create.start() -> start creation process');
          }
        }
      };
    }

    // Composite Process Creation - advanced workflow modeling
    if (['bpmn:StartEvent', 'bpmn:ExclusiveGateway'].includes(type)) {
      entries['inheritance.composite-process'] = {
        group: 'model',
        className: 'bpmn-icon-subprocess-expanded',
        title: 'Inheritance: Create Composite Process',
        action: {
          click: (event: any, element: any) => {
            console.log('[Inheritance] Creating composite process');
            console.log('This would create a subprocess with embedded workflow');
            console.log('Using inherited modeling:', !!_modeling);
          }
        }
      };
    }

    // Smart User Task - business rule driven creation
    if (['bpmn:StartEvent', 'bpmn:ExclusiveGateway', 'bpmn:ParallelGateway'].includes(type)) {
      entries['inheritance.smart-user-task'] = {
        group: 'model',
        className: 'bpmn-icon-user-task',
        title: 'Inheritance: Smart User Task',
        action: {
          click: (event: any, element: any) => {
            console.log('[Inheritance] Creating smart user task');
            console.log('This would apply business rules for user task creation');
            console.log('Business context:', this._businessCustomOptions);
          }
        }
      };
    }

    // Quality Assurance Check - validation before creation
    if (['bpmn:EndEvent'].includes(type)) {
      entries['inheritance.qa-check'] = {
        group: 'validate',
        className: 'bpmn-icon-ok-circle',
        title: 'Inheritance: QA Validation Check',
        action: {
          click: (event: any, element: any) => {
            console.log('[Inheritance] Running QA validation checks');
            console.log('Checking process completeness, business rules, etc.');
            console.log('Using inherited _rules service for validation');
          }
        }
      };
    }
  }

  /**
   * Business rule engine - demonstrates advanced inheritance customization
   */
  protected filterEntriesByBusinessRules(entries: any, element: any): any {
    const filtered = { ...entries };

    // Business rule: Remove advanced actions in restricted contexts
    if (element.businessObject?.get('restrictAdvancedActions')) {
      delete filtered['inheritance.composite-process'];
      delete filtered['inheritance.smart-user-task'];
    }

    // Business rule: Add regulatory compliance actions when required
    if (this._businessCustomOptions?.requiresCompliance) {
      filtered['inheritance.compliance-check'] = {
        group: 'validate',
        className: 'bpmn-icon-shield',
        title: 'Inheritance: Compliance Check',
        action: {
          click: () => {
            console.log('[Inheritance] Running compliance checks');
          }
        }
      };
    }

    return filtered;
  }

  /**
   * Custom business logic method - shows encapsulation in inheritance
   */
  private createBusinessAwareElement(event: any, element: any, elementType: string): void {
    console.log(`[Inheritance] Creating business-aware ${elementType}`);
    console.log('Applying business rules and options');
    console.log('Validating against inherited business context');

    // In real bpmn-js inheritance, this would:
    // 1. Use _elementFactory to create the shape
    // 2. Apply business options to businessObject
    // 3. Use _create service to start placement
    // 4. Use _rules to validate the operation
  }

  /**
   * Enhanced element creation with business intelligence
   * Demonstrates how inheritance enables complex business logic
   */
  private applyBusinessLogic(shape: any, elementType: string): void {
    console.log(`[Inheritance] Applying business logic for ${elementType}`);

    // Business logic examples (would use inherited properties):
    // - Access _modeling to understand current process
    // - Use _rules to validate business constraints
    // - Apply business options from _businessCustomOptions
    // - Trigger events via inherited eventBus access

    console.log('- Accessing inherited _modeling for process context');
    console.log('- Using inherited _rules for business rule validation');
    console.log('- Applying business options:', this._businessCustomOptions);
  }
}

// Dependency injection configuration for inheritance approach
export const inheritanceModule = {
  __init__: ['contextPadProvider'],
  __depends__: [],
  contextPadProvider: ['type', InheritedContextPadProvider]
};

// Education notice
console.info(`
🎓  INHERITANCE PATTERN DEMONSTRATION

This InheritedContextPadProvider shows the TRUE inheritance pattern:

✅ Extends BaseContextPadProvider (or real bpmn-js ContextPadProvider)
✅ Overrides methods with custom implementations
✅ Calls super() for proper initialization
✅ Merges base entries with custom entries
✅ Accesses inherited services and properties

Inheritance advantages:
• Clean code organization
• Precise behavior customization
• Access to base class services
• Method override capability

For bpmn-js applications, inheritance provides excellent extensibility
while maintaining the integrity of core functionality.
`);

// Export the inheritance class
export default InheritedContextPadProvider;
