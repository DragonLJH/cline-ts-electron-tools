/**
 * Custom Properties Panel Configuration Interface
 */
export interface CustomPropertiesPanelConfig {
  parent?: string | HTMLElement;
  layout?: {
    groups?: any[];
    open?: boolean;
  };
  description?: {
    [key: string]: string;
  };
  tooltip?: {
    [key: string]: string;
  };
  feelPopupContainer?: HTMLElement;
  theme?: 'light' | 'dark' | 'auto';
  customCSS?: string;
  showToolbar?: boolean;
  showSearch?: boolean;
  showElementInfo?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableTooltips?: boolean;
}

/**
 * Element information interface
 */
interface ElementInfo {
  id: string;
  type: string;
  name?: string;
}

/**
 * Properties panel context interface
 */
interface PropertiesPanelContext {
  element?: any;
  properties?: any;
  theme?: string;
  layout?: any;
  [key: string]: any;
}

/**
 * Theme configuration interface
 */
interface ThemeConfig {
  name: 'light' | 'dark' | 'auto';
  customCSS?: string;
}

/**
 * CustomPropertiesPanelRenderer - 自定义属性面板渲染器
 *
 * 完全自包含的自定义实现，不依赖任何父类
 */
export class CustomPropertiesPanelRenderer {
  private config: CustomPropertiesPanelConfig;
  private injector: any;
  private eventBus: any;
  private container: HTMLElement | null = null;
  private currentElement: any = null;
  private keyDownHandler?: (event: KeyboardEvent) => void;
  private eventListeners: Array<{ event: string; callback: (context: PropertiesPanelContext) => void; id: string }> = [];
  private isAttached: boolean = false;

  constructor(config: CustomPropertiesPanelConfig, injector: any, eventBus: any) {
    this.config = config;
    this.injector = injector;
    this.eventBus = eventBus;
    this.setupEventListeners();
    this.initializeContainer();
  }

  /**
   * Setup event listeners for custom properties panel
   */
  private setupEventListeners(): void {
    const baseEvents = ['propertiesPanel.customUpdate', 'propertiesPanel.styleChange', 'propertiesPanel.save', 'propertiesPanel.close'];
    const keyboardEvents = ['propertiesPanel.undo', 'propertiesPanel.redo'];
    const allEvents = this.config.enableKeyboardShortcuts !== false ? [...baseEvents, ...keyboardEvents] : baseEvents;

    allEvents.forEach(event => {
      const callback = this.createEventHandler(event);
      this.eventBus.on(event, callback);
      this.eventListeners.push({ event, callback, id: `${event}_${Date.now()}` });
    });

    // Listen for selection changes to update panel
    this.eventBus.on('selection.changed', (context: PropertiesPanelContext) => {
      this.updateSelection(context);
    });
  }

  /**
   * Create event handler for specific event
   */
  private createEventHandler(event: string): (context: PropertiesPanelContext) => void {
    switch (event) {
      case 'propertiesPanel.customUpdate':
        return (context) => this.handleCustomUpdate(context);
      case 'propertiesPanel.styleChange':
        return (context) => this.handleStyleChange(context);
      case 'propertiesPanel.save':
        return () => this.handleSave();
      case 'propertiesPanel.undo':
        return () => this.handleUndo();
      case 'propertiesPanel.redo':
        return () => this.handleRedo();
      case 'propertiesPanel.close':
        return () => this.handleClose();
      default:
        return (context) => {
          console.warn(`Unhandled properties panel event: ${event}`, context);
        };
    }
  }

  /**
   * Initialize the panel container
   */
  private initializeContainer(): void {
    if (this.config.parent) {
      const parentElement = typeof this.config.parent === 'string'
        ? document.querySelector(this.config.parent) as HTMLElement
        : this.config.parent;

      if (parentElement) {
        this.container = document.createElement('div');
        this.container.className = 'custom-properties-panel';
        this.container.setAttribute('data-theme', this.config.theme || 'light');

        // Add keyboard event listener if enabled
        if (this.config.enableKeyboardShortcuts !== false) {
          this.setupKeyboardShortcuts();
        }

        parentElement.appendChild(this.container);

        // Apply initial theme
        if (this.config.theme) {
          this.applyTheme(this.config.theme);
        }

        // Apply custom CSS if provided
        if (this.config.customCSS) {
          this.applyCustomCSS(this.config.customCSS);
        }

        // Add toolbar if enabled
        if (this.config.showToolbar) {
          this.addToolbar();
        }

        // Add search if enabled
        if (this.config.showSearch) {
          this.addSearch();
        }

        this.isAttached = true;
      } else {
        console.warn('Properties panel parent element not found:', this.config.parent);
      }
    }
  }

  /**
   * Handle custom update event
   */
  private handleCustomUpdate(context: PropertiesPanelContext): void {
    const { element, properties } = context;
    if (element && properties) {
      try {
        this.injector.get('modeling').updateProperties(element, properties);
        this.update(element);
      } catch (error) {
        console.error('Error updating properties:', error);
      }
    }
  }

  /**
   * Handle style change event
   */
  private handleStyleChange(context: PropertiesPanelContext): void {
    if (context.theme) {
      this.applyTheme(context.theme as 'light' | 'dark' | 'auto');
    }
    if (context.layout) {
      this.applyLayout(context.layout);
    }
  }

  /**
   * Handle save action
   */
  private handleSave(): void {
    if (this.currentElement) {
      this.eventBus.fire('propertiesPanel.saved', { element: this.currentElement });
    }
  }

  /**
   * Handle undo action
   */
  private handleUndo(): void {
    this.eventBus.fire('commandStack.undo.executed');
  }

  /**
   * Handle redo action
   */
  private handleRedo(): void {
    this.eventBus.fire('commandStack.redo.executed');
  }

  /**
   * Handle close action
   */
  private handleClose(): void {
    this.detach();
  }

  /**
   * Update selection and panel content
   */
  private updateSelection(context: PropertiesPanelContext): void {
    const { newSelection } = context;
    if (newSelection && newSelection.length > 0) {
      this.update(newSelection[0]);
    } else {
      this.clearPanel();
    }
  }

  /**
   * Apply theme to the panel
   */
  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    if (!this.container) return;

    // Remove old theme classes
    this.container.classList.remove('theme-light', 'theme-dark', 'theme-auto');

    // Add new theme class
    this.container.classList.add(`theme-${theme}`);
    this.container.setAttribute('data-theme', theme);

    // Fire theme applied event
    this.eventBus.fire('propertiesPanel.themeApplied', { theme });
  }

  /**
   * Apply layout configuration
   */
  private applyLayout(layout: any): void {
    // Implementation depends on specific layout requirements
    console.log('Applying layout:', layout);
  }

  /**
   * Apply custom CSS
   */
  private applyCustomCSS(css: string): void {
    let styleElement = document.getElementById('custom-properties-panel-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-properties-panel-styles';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
  }

  /**
   * Update panel with element information
   */
  public update(element?: any): void {
    this.currentElement = element;

    if (!this.container) {
      console.warn('Properties panel container not initialized');
      return;
    }

    // Clear existing content
    this.clearPanelContent();

    if (!element) {
      this.renderEmptyState();
      return;
    }

    // Render element information if enabled
    if (this.config.showElementInfo !== false) {
      this.renderElementInfo(element);
    }

    // Render standard properties panel content
    this.renderPropertyGroups(element);

    // Enhance tooltips if enabled
    if (this.config.enableTooltips !== false) {
      this.enhanceTooltips();
    }
  }

  /**
   * Clear panel content
   */
  private clearPanelContent(): void {
    if (!this.container) return;

    const contentAreas = this.container.querySelectorAll('.panel-content, .element-info, .property-groups');
    contentAreas.forEach(area => area.remove());
  }

  /**
   * Clear entire panel
   */
  private clearPanel(): void {
    this.clearPanelContent();
    this.currentElement = null;
  }

  /**
   * Render empty state when no element is selected
   */
  private renderEmptyState(): void {
    if (!this.container) return;

    const emptyState = document.createElement('div');
    emptyState.className = 'panel-empty-state';
    emptyState.innerHTML = '<p>请在画布中选择一个元素</p>';

    this.container.appendChild(emptyState);
  }

  /**
   * Render element information
   */
  private renderElementInfo(element: any): void {
    if (!this.container) return;

    const elementInfo = this.getElementInfo(element);
    if (!elementInfo) return;

    const infoContainer = document.createElement('div');
    infoContainer.className = 'element-info';
    infoContainer.innerHTML = `
      <h4>元素信息</h4>
      <div class="info-item"><strong>ID:</strong> <span>${elementInfo.id}</span></div>
      <div class="info-item"><strong>类型:</strong> <span>${elementInfo.type}</span></div>
      ${elementInfo.name ? `<div class="info-item"><strong>名称:</strong> <span>${elementInfo.name}</span></div>` : ''}
    `;

    this.container.appendChild(infoContainer);
  }

  /**
   * Get element information
   */
  private getElementInfo(element: any): ElementInfo | null {
    if (!element) return null;

    const businessObject = element.businessObject;
    if (!businessObject) return null;

    return {
      id: businessObject.id || '未设置',
      type: businessObject.$type || element.type || '未知',
      name: businessObject.name || ''
    };
  }

  /**
   * Render property groups (placeholder for actual property rendering)
   */
  private renderPropertyGroups(element: any): void {
    if (!this.container) return;

    const groupsContainer = document.createElement('div');
    groupsContainer.className = 'property-groups';
    groupsContainer.innerHTML = '<p>属性组将在此处渲染...</p>';

    this.container.appendChild(groupsContainer);
  }

  /**
   * Enhance tooltips for interactive elements
   */
  private enhanceTooltips(): void {
    if (!this.container) return;

    const tooltipElements = this.container.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.addEventListener('mouseenter', (e: Event) => {
        const target = e.target as HTMLElement;
        const content = target.dataset.tooltip;
        if (content) {
          this.showCustomTooltip(target, content);
        }
      });

      htmlElement.addEventListener('mouseleave', () => {
        this.hideCustomTooltip();
      });
    });
  }

  /**
   * Show custom tooltip
   */
  private showCustomTooltip(element: HTMLElement, content: string): void {
    // Remove existing tooltip
    this.hideCustomTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = content;

    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 40}px`;

    // Make tooltip visible
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.classList.add('visible'), 10);
  }

  /**
   * Hide custom tooltip
   */
  private hideCustomTooltip(): void {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 200);
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    if (!this.container) return;

    this.keyDownHandler = (event: KeyboardEvent) => {
      // Ctrl+S - Save
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        this.handleSave();
        return;
      }

      // Ctrl+Z - Undo
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        this.handleUndo();
        return;
      }

      // Ctrl+Y - Redo
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        this.handleRedo();
        return;
      }

      // Escape - Close
      if (event.key === 'Escape') {
        this.handleClose();
        return;
      }
    };

    this.container.addEventListener('keydown', this.keyDownHandler);
  }

  /**
   * Add toolbar with action buttons
   */
  private addToolbar(): void {
    if (!this.container) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'custom-properties-toolbar';

    toolbar.innerHTML = `
      <button class="toolbar-btn save-btn" title="保存 (Ctrl+S)" data-tooltip="保存更改">
        <span>💾</span> 保存
      </button>
      <button class="toolbar-btn undo-btn" title="撤销 (Ctrl+Z)" data-tooltip="撤销上一步操作">
        <span>↶</span> 撤销
      </button>
      <button class="toolbar-btn redo-btn" title="重做 (Ctrl+Y)" data-tooltip="重做操作">
        <span>↷</span> 重做
      </button>
    `;

    // Add event listeners
    const saveBtn = toolbar.querySelector('.save-btn') as HTMLButtonElement;
    const undoBtn = toolbar.querySelector('.undo-btn') as HTMLButtonElement;
    const redoBtn = toolbar.querySelector('.redo-btn') as HTMLButtonElement;

    if (saveBtn) saveBtn.addEventListener('click', () => this.handleSave());
    if (undoBtn) undoBtn.addEventListener('click', () => this.handleUndo());
    if (redoBtn) redoBtn.addEventListener('click', () => this.handleRedo());

    // Insert at the beginning
    if (this.container.firstChild) {
      this.container.insertBefore(toolbar, this.container.firstChild);
    } else {
      this.container.appendChild(toolbar);
    }
  }

  /**
   * Add search functionality
   */
  private addSearch(): void {
    if (!this.container) return;

    const searchContainer = document.createElement('div');
    searchContainer.className = 'custom-properties-search';

    searchContainer.innerHTML = `
      <div class="search-wrapper">
        <input type="text" placeholder="搜索属性..." class="search-input">
        <button class="clear-search" title="清除搜索">✕</button>
      </div>
    `;

    const searchInput = searchContainer.querySelector('.search-input') as HTMLInputElement;
    const clearBtn = searchContainer.querySelector('.clear-search') as HTMLButtonElement;

    if (searchInput) {
      searchInput.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.filterProperties(target.value);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.filterProperties('');
      });
    }

    // Insert after toolbar but before other content
    const toolbar = this.container.querySelector('.custom-properties-toolbar');
    const insertPoint = toolbar ? toolbar.nextSibling : this.container.firstChild;

    if (insertPoint) {
      this.container.insertBefore(searchContainer, insertPoint);
    } else {
      this.container.appendChild(searchContainer);
    }
  }

  /**
   * Filter properties based on search query
   */
  private filterProperties(query: string): void {
    if (!this.container) return;

    const groups = this.container.querySelectorAll('.property-group, .property-item');
    const queryLower = query.toLowerCase();

    groups.forEach((group: Element) => {
      const htmlElement = group as HTMLElement;
      const text = htmlElement.textContent?.toLowerCase() || '';
      const isVisible = !query || text.includes(queryLower);
      htmlElement.style.display = isVisible ? '' : 'none';
    });
  }

  /**
   * Attach the panel to a parent element
   */
  public attachTo(parentElement: HTMLElement | string): void {
    if (this.isAttached) {
      this.detach();
    }

    const parent = typeof parentElement === 'string'
      ? document.querySelector(parentElement) as HTMLElement
      : parentElement;

    if (parent && parent !== this.container?.parentElement) {
      parent.appendChild(this.container!);
      this.isAttached = true;
    }
  }

  /**
   * Detach the panel from its parent
   */
  public detach(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
      this.isAttached = false;
    }
  }

  /**
   * Destroy the panel and clean up resources
   */
  public destroy(): void {
    // Clean up event listeners
    this.eventListeners.forEach(({ event, callback }) => {
      this.eventBus.off(event, callback);
    });
    this.eventListeners = [];

    // Remove keyboard shortcuts
    if (this.keyDownHandler && this.container) {
      this.container.removeEventListener('keydown', this.keyDownHandler);
      this.keyDownHandler = undefined;
    }

    // Hide any visible tooltips
    this.hideCustomTooltip();

    // Remove custom styles
    const customStyles = document.getElementById('custom-properties-panel-styles');
    if (customStyles) {
      customStyles.remove();
    }

    // Detach and remove container
    this.detach();
    this.container = null;

    this.isAttached = false;
  }

  /**
   * Get current configuration
   */
  public getConfig(): CustomPropertiesPanelConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<CustomPropertiesPanelConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Reapply theme if changed
    if (newConfig.theme) {
      this.applyTheme(newConfig.theme);
    }

    // Reapply custom CSS if changed
    if (newConfig.customCSS) {
      this.applyCustomCSS(newConfig.customCSS);
    }

    // Update visibility of features
    this.updateFeatureVisibility();
  }

  /**
   * Update feature visibility based on configuration
   */
  private updateFeatureVisibility(): void {
    if (!this.container) return;

    // Update toolbar visibility
    const toolbar = this.container.querySelector('.custom-properties-toolbar') as HTMLElement;
    if (toolbar) {
      toolbar.style.display = this.config.showToolbar ? '' : 'none';
    }

    // Update search visibility
    const search = this.container.querySelector('.custom-properties-search') as HTMLElement;
    if (search) {
      search.style.display = this.config.showSearch ? '' : 'none';
    }
  }
}

/**
 * CustomPropertiesPanelModule - 自定义属性面板模块
 * 为 BPMN Modeler 提供自定义属性面板功能
 */
export class CustomPropertiesPanelModule {
  private config: CustomPropertiesPanelConfig;

  constructor(config: CustomPropertiesPanelConfig = {}) {
    this.config = {
      parent: '#properties-panel',
      layout: {
        groups: [],
        open: true
      },
      description: {},
      tooltip: {},
      feelPopupContainer: document.body,
      theme: 'light',
      showToolbar: true,
      showSearch: false,
      showElementInfo: true,
      enableKeyboardShortcuts: true,
      enableTooltips: true,
      ...config
    };
  }

  /**
   * Module initialization array - required by diagram-js
   */
  public __init__: string[] = ['customPropertiesPanel'];

  /**
   * Module dependencies - registers the custom properties panel
   */
  public customPropertiesPanel: ['type', typeof CustomPropertiesPanelRenderer] = ['type', CustomPropertiesPanelRenderer];
}

// Default configuration export
export const defaultCustomPropertiesConfig: CustomPropertiesPanelConfig = {
  parent: '#properties-panel',
  layout: {
    groups: [],
    open: true
  },
  description: {},
  tooltip: {},
  feelPopupContainer: document.body,
  theme: 'light',
  showToolbar: true,
  showSearch: false,
  showElementInfo: true,
  enableKeyboardShortcuts: true,
  enableTooltips: true
};

// Export default configuration with alias
export { defaultCustomPropertiesConfig as CustomPropertiesConfig };
