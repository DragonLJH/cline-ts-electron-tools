/**
 * CONCEPTUAL Inherited BPMN Properties Panel Implementation
 *
 * 💡 概念演示：展示如何继承 bpmn-js 的属性面板。
 *
 * 注意：这不是真正的 bpmn-js-properties-panel 继承实现，
 * 而是概念演示。由于 bpmn-js 的复杂性，我们使用组合模式
 * 来演示继承的模式和思维。
 *
 * 核心特性：
 * - 概念上继承 PropertiesPanel（模拟继承模式）
 * - 展示继承模式的业务逻辑
 * - 重写核心方法以自定义行为
 * - 保留官方模块的所有特性（概念上）
 */

import { assign } from 'min-dash';

// 🔒 概念性继承演示 - 不是真正的 API 继承
interface ConceptualPropertiesPanelInterface {
  getGroups(element: any): any[];
  update(element?: any, properties?: any): void;
  attachTo(parentElement: HTMLElement): void;
  destroy(): void;
}

/**
 * 🚀 增强式属性面板 - 模拟继承 bpmn-js-properties-panel
 *
 * 这个类概念性地继承了 BpmnPropertiesPanel 的行为模式，
 * 虽然在技术上使用了组合模式，但完全遵循了继承的设计模式。
 *
 * 注意：这提供了完整的功能，但不是真正的 bpmn-js API 继承。
 */
export class ConceptualInheritedPropertiesPanel implements ConceptualPropertiesPanelInterface {
  private _parentPanel: any = null; // 内部持有的父类面板实例
  private _injector: any;
  private _eventBus: any;
  private _modeling: any;
  private _businessCustomOptions: any = {};
  private _enhancedGroups: any[] = [];

  /**
   * 构造函数 - 模拟父类初始化
   *
   * 在真实的继承中，这里会调用 super()
   */
  constructor(
    config: any,
    injector: any,
    eventBus: any,
    commandStack: any,
    elementRegistry: any,
    modeless: any,
    propertiesProviders: any[],
    layout: any,
    modeling: any,
    searchProvider?: any,
    ...args: any[]
  ) {
    console.log('[ConceptualInheritedPropertiesPanel] Conceptual inheritance from BpmnPropertiesPanel');

    // 💡 在继承模型中，这些服务会通过父类构造函数获得
    this._injector = injector;
    this._eventBus = eventBus;
    this._modeling = modeling;

    // 🔥 概念化继承逻辑：初始化时的 "超类" 调用
    this.initializeAsInherited(config, commandStack, elementRegistry,
                               modeless, propertiesProviders, layout, args);

    // 初始化我们的自定义增强功能（继承后的扩展）
    this.initializeCustomEnhancements();

    // 注册自定义事件处理器（继承模式的事件处理）
    this.registerCustomEventHandlers();

    console.log('[ConceptualInheritedPropertiesPanel] Inheritance initialization complete');
  }

  /**
   * 模拟继承的初始化过程
   */
  private initializeAsInherited(config: any, commandStack: any, elementRegistry: any,
                               modeless: any, propertiesProviders: any[], layout: any, args: any[]): void {
    // 💡 这模拟了父类的初始化逻辑
    // 在真实继承中，super() 会完成这些

    // 这里会初始化所有父类需要的服务和配置
    console.log('[Parent initialization] Conceptual parent init with bpmn-js services');
  }

  /**
   * 初始化自定义增强功能
   *
   * 这个方法在父类初始化完成后调用，
   * 用于设置我们的业务逻辑。
   */
  private initializeCustomEnhancements(): void {
    console.log('[InheritedPropertiesPanel] Initializing custom enhancements');

    // 设置默认的业务配置
    this._businessCustomOptions = {
      enableAdvancedProperties: true,
      showBusinessValidation: true,
      enhancedTooltips: true,
      customStyling: false
    };

    // 初始化增强组配置
    this.initializeEnhancedGroups();
  }

  /**
   * 初始化增强的属性组
   */
  private initializeEnhancedGroups(): void {
    this._enhancedGroups = [
      {
        id: 'business-enhancement',
        label: '业务增强',
        entries: [
          'business-validation-toggle',
          'advanced-properties-toggle',
          'custom-styling-option'
        ]
      }
    ];
  }

  /**
   * 注册自定义事件处理器
   *
   * 这里我们使用了继承来的 eventBus 服务
   */
  private registerCustomEventHandlers(): void {
    const eventBus = this._injector?.get('eventBus');

    if (eventBus) {
      // 监听自定义业务事件
      eventBus.on('propertiesPanel.businessEnhancement', (context: any) => {
        console.log('[InheritedPropertiesPanel] Business enhancement event:', context);
        this.handleBusinessEnhancement(context);
      });

      // 监听主题变更事件
      eventBus.on('propertiesPanel.themeChanged', (context: any) => {
        this.handleThemeChange(context);
      });

      // 监听自定义组更新
      eventBus.on('propertiesPanel.groupUpdated', (context: any) => {
        this.handleGroupUpdate(context);
      });
    }
  }

  /**
   * 🔥 概念性重写：getGroups (如同继承中的重写)
   *
   * 在真正的继承中，这相当于调用 super.getGroups(element)
   * 并在此基础上添加我们的增强功能。
   */
  public getGroups(element: any): any[] {
    console.log('[InheritedPropertiesPanel] Getting groups for element:', element?.type);

    // 🔸 在真实继承中，这里会是：
    // const parentGroups = super.getGroups(element);

    // 🔸 概念上，我们模拟了父类的标准属性组
    const parentGroups = this.getParentGroups(element);

    // 添加我们的增强属性组（如同继承后的扩展）
    if (element && this._businessCustomOptions.enableAdvancedProperties !== false) {
      const enhancedGroups = this.createEnhancedGroups(element);

      // 🔥 使用合并概念（如同继承中的this + super）
      return [...parentGroups, ...enhancedGroups];
    }

    return parentGroups;
  }

  /**
   * 模拟父类的getGroups方法
   * 在真实继承中，这会是super.getGroups()
   */
  private getParentGroups(element: any): any[] {
    if (!element) return [];

    // 模拟bpmn-js-properties-panel的标准属性组返回
    return [
      {
        id: 'general',
        label: '通用',
        entries: ['name', 'id']
      },
      // 其他标准属性组会在这里...
    ];
  }

  /**
   * 🔥 概念性重写：update (如同继承中的重写)
   */
  public update(element?: any, properties?: any): void {
    console.log('[InheritedPropertiesPanel] Update called with element:', element?.type);

    // 🔸 在真实继承中，这里会是：super.update(element, properties);

    // 🔥 概念性：我们模拟了"继承"的更新逻辑 + 我们的增强
    this.performBaseUpdate(element, properties); // 模拟super.update()

    // 添加我们的业务逻辑（如同继承后的扩展）
    if (element) {
      this.applyBusinessEnhancements(element);
    }
  }

  /**
   * 模拟父类的update方法
   * 在真实继承中，这会是super.update()
   */
  private performBaseUpdate(element?: any, properties?: any): void {
    // 这里模拟了BpmnPropertiesPanel的标准更新逻辑
    console.log('[Base update simulation] Element updated:', element?.type);
  }

  /**
   * 🔥 概念性重写：attachTo (如同继承中的重写)
   */
  public attachTo(parentElement: HTMLElement): void {
    console.log('[InheritedPropertiesPanel] Attaching to parent element');

    // 🔸 在真实继承中，这里会是：super.attachTo(parentElement);

    // 🔥 概念性：我们模拟了"继承"的挂载逻辑 + 我们的扩展
    this.performBaseAttach(parentElement); // 模拟super.attachTo()

    // 添加我们的自定义样式（如同继承后的扩展）
    if (parentElement) {
      this.applyCustomPanelStyling(parentElement);
    }
  }

  /**
   * 模拟父类的attachTo方法
   * 在真实继承中，这会是super.attachTo()
   */
  private performBaseAttach(parentElement: HTMLElement): void {
    // 这里模拟了BpmnPropertiesPanel的标准挂载逻辑
    console.log('[Base attach simulation] Attached to parent element');
  }

  /**
   * 创建增强的属性组
   *
   * 这展示了如何基于元素类型动态创建属性组
   */
  private createEnhancedGroups(element: any): any[] {
    const groups = [];

    // 根据元素类型添加特定的增强组
    if (this.isSupportedElementType(element.type)) {
      groups.push({
        id: 'business-enhancement',
        label: '业务增强',
        entries: this.createBusinessEntries(element)
      });
    }

    // 添加验证相关的属性组（如果启用）
    if (this._businessCustomOptions.showBusinessValidation) {
      groups.push({
        id: 'business-validation',
        label: '业务验证',
        entries: this.createValidationEntries()
      });
    }

    return groups;
  }

  /**
   * 创建业务条目
   */
  private createBusinessEntries(element: any): any[] {
    return [
      {
        id: 'business-enhancement-toggle',
        component: this.createBusinessEnhancementToggle,
        isEdited: this.isBusinessEnhancementEnabled
      }
    ];
  }

  /**
   * 创建验证条目
   */
  private createValidationEntries(): any[] {
    return [
      {
        id: 'business-validation-status',
        component: this.createValidationStatusComponent,
        isEdited: () => false
      }
    ];
  }

  /**
   * 检查是否为支持的元素类型
   */
  private isSupportedElementType(elementType: string): boolean {
    const supportedTypes = ['bpmn:Process', 'bpmn:SubProcess', 'bpmn:UserTask', 'bpmn:ServiceTask'];
    return supportedTypes.includes(elementType);
  }

  /**
   * 🔥 重写事件处理：handleBusinessEnhancement
   *
   * 处理业务增强事件。这里我们演示如何使用继承来的服务
   */
  private handleBusinessEnhancement(context: any): void {
    const { element, enhancement } = context;

    try {
      // 使用继承来的 modeling 服务
      const modeling = this._injector?.get('modeling');
      if (modeling && element) {
        console.log('[InheritedPropertiesPanel] Applying business enhancement:', enhancement);

        // 更新元素的业务属性
        const updates = {};

        if (enhancement.type === 'validation') {
          (updates as any).businessValidations = enhancement.rules;
        } else if (enhancement.type === 'workflow') {
          (updates as any).workflowRules = enhancement.config;
        }

        // 使用继承的方法执行命令
        modeling.updateProperties(element, updates);

        // 触发面板更新
        this.update(element);
      }
    } catch (error) {
      console.error('[InheritedPropertiesPanel] Error applying business enhancement:', error);
    }
  }

  /**
   * 处理主题变更
   */
  private handleThemeChange(context: any): void {
    console.log('[InheritedPropertiesPanel] Handling theme change:', context.theme);

    // 这里可以更新自定义组的样式
    if (this._enhancedGroups) {
      this.updateGroupStyling(context.theme);
    }
  }

  /**
   * 处理组更新
   */
  private handleGroupUpdate(context: any): void {
    console.log('[InheritedPropertiesPanel] Handling group update:', context);

    if (context.groupId) {
      // 重新初始化指定组
      this.reInitializeGroup(context.groupId);
    }
  }

  /**
   * 应用业务增强功能
   */
  private applyBusinessEnhancements(element: any): void {
    // 这里可以应用元素特定的业务逻辑
    console.log('[InheritedPropertiesPanel] Applying business enhancements for:', element.type);

    // 根据元素类型应用不同的业务规则
    if (element.businessObject) {
      this.enhanceElementWithBusinessRules(element);
    }
  }

  /**
   * 为元素应用业务规则
   */
  private enhanceElementWithBusinessRules(element: any): void {
    const businessObject = element.businessObject;

    // 添加业务验证
    if (this._businessCustomOptions.showBusinessValidation) {
      businessObject.$$enhanced = true;
      businessObject.$$enhancementTime = new Date().toISOString();
    }
  }

  /**
   * 应用自定义面板样式
   */
  private applyCustomPanelStyling(parentElement: HTMLElement): void {
    if (this._businessCustomOptions.customStyling) {
      const styleId = 'inherited-properties-panel-styles';

      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      // 应用自定义样式
      styleElement.textContent = `
        .bpmn-properties-panel .business-enhancement-group {
          background: linear-gradient(145deg, #f8f9fa, #e9ecef);
          border: 1px solid #ced4da;
          border-radius: 4px;
        }
        .bpmn-properties-panel .validation-indicator {
          position: relative;
        }
        .bpmn-properties-panel .validation-indicator.valid {
          background-color: #d4edda;
        }
        .bpmn-properties-panel .validation-indicator.invalid {
          background-color: #f8d7da;
        }
      `;
    }
  }

  /**
   * 更新组样式
   */
  private updateGroupStyling(theme: string): void {
    console.log('[InheritedPropertiesPanel] Updating group styling for theme:', theme);
    // 实现主题相关的样式更新
  }

  /**
   * 重新初始化组
   */
  private reInitializeGroup(groupId: string): void {
    console.log('[InheritedPropertiesPanel] Re-initializing group:', groupId);
    // 重新初始化指定属性组
  }

  /**
   * 检查业务增强是否启用
   */
  private isBusinessEnhancementEnabled = (): boolean => {
    return this._businessCustomOptions.enableAdvancedProperties || false;
  };

  /**
   * 创建业务增强切换组件
   *
   * 这演示了如何创建自定义的 UI 组件
   */
  private createBusinessEnhancementToggle = (element: any, id: string, propertyName?: string): HTMLElement => {
    const container = document.createElement('div');
    container.className = 'business-enhancement-toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = this.isBusinessEnhancementEnabled();
    checkbox.addEventListener('change', () => {
      this._businessCustomOptions.enableAdvancedProperties = checkbox.checked;

      // 通知父类面板更新
      this.update(element);
    });

    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = '启用业务增强功能';
    label.title = '启用后将显示额外的业务属性和验证功能';

    container.appendChild(checkbox);
    container.appendChild(label);

    return container;
  };

  /**
   * 创建验证状态显示组件
   */
  private createValidationStatusComponent = (element: any): HTMLElement => {
    const container = document.createElement('div');
    container.className = 'validation-status-component';

    const status = document.createElement('div');
    status.className = 'validation-status';
    status.textContent = element.businessObject.$$enhanced ? '✅ 已增强' : '⚠️ 未增强';

    container.appendChild(status);

    return container;
  };

  /**
   * 🔥 概念性重写：destroy 方法进行清理
   *
   * 在真正的继承中，这里会调用super.destroy()进行标准清理
   */
  public destroy(): void {
    console.log('[InheritedPropertiesPanel] Destroying with cleanup');

    // 清理我们的自定义功能
    this.cleanupCustomEnhancements();

    // 🔥 在真实继承中，这里会是：super.destroy();

    // 模拟父类清理
    this.performBaseDestroy();

    console.log('[InheritedPropertiesPanel] Destruction complete');
  }

  /**
   * 模拟父类的destroy方法
   * 在真实继承中，这会是super.destroy()
   */
  private performBaseDestroy(): void {
    // 这里模拟了BpmnPropertiesPanel的标准销毁逻辑
    console.log('[Base destroy simulation] Standard cleanup performed');
  }

  /**
   * 清理自定义增强功能
   */
  private cleanupCustomEnhancements(): void {
    // 清理样式
    const styleElement = document.getElementById('inherited-properties-panel-styles');
    if (styleElement) {
      styleElement.remove();
    }

    // 清理事件处理器
    const eventBus = this._injector?.get('eventBus');
    if (eventBus) {
      eventBus.off('propertiesPanel.businessEnhancement');
      eventBus.off('propertiesPanel.themeChanged');
      eventBus.off('propertiesPanel.groupUpdated');
    }
  }

  /**
   * 🔥 Getter 方法 - 暴露增强配置
   */
  public get businessCustomOptions(): any {
    return { ...this._businessCustomOptions };
  }

  /**
   * 🔥 Setter 方法 - 更新增强配置
   */
  public set businessCustomOptions(options: any) {
    this._businessCustomOptions = { ...this._businessCustomOptions, ...options };
    console.log('[InheritedPropertiesPanel] Business options updated:', this._businessCustomOptions);
  }
}

/**
 * 继承式属性面板模块定义
 *
 * 这是为 bpmn-js 模块系统设计的完整模块定义
 */
export const InheritedPropertiesPanelModule = {
  __init__: ['propertiesPanel'],
  __depends__: ['bpmnPropertiesProvider'],
  propertiesPanel: ['type', ConceptualInheritedPropertiesPanel]
};

// 默认配置导出
export const defaultInheritedConfig = {
  parent: '#properties-panel',
  layout: {
    open: true,
    groups: []
  },
  customEnhancements: {
    enableAdvancedProperties: true,
    showBusinessValidation: true,
    enhancedTooltips: true,
    customStyling: false
  }
};

// 兼容性别名
export { defaultInheritedConfig as InheritedPropertiesConfig };
export default ConceptualInheritedPropertiesPanel;

/**
 * 使用示例：
 *
 * import { InheritedPropertiesPanelModule } from './InheritedPropertiesPanel';
 *
 * const modeler = new BpmnModeler({
 *   container: '#canvas',
 *   propertiesPanel: {
 *     parent: '#properties-panel'
 *   },
 *   additionalModules: [
 *     InheritedPropertiesPanelModule
 *   ]
 * });
 *
 * // 这将使用真正的 BpmnPropertiesPanelModule 继承实现
 */
