import { domify, query } from 'min-dom'
import { reduce, isArray, find, set } from 'min-dash'
import { showModal } from '@/utils'
import { useUnmount } from '@/utils/useHooks'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/Commom'
import { Input } from '@/components/Input'
import { Select } from '@/components/Selection'
import { BpmnTranslations, LanguageManager } from '@/utils/locales'
import CustomLoggerModule from '../CustomLoggerService/CustomLoggerService'
import CustomConfigModule from '../CustomConfigService/CustomConfigService'
import { CustomLoggerService } from '../CustomLoggerService/CustomLoggerService'
import type {
    CustomPropertiesPanelConfig,
    Injector,
    EventBus,
    Provider,
    BpmnElement,
    BpmnPropertiesPanelProps,
    BpmnPropertiesPanelState,
    PanelBoxProps,
    Canvas,
    ElementRegistry,
    Modeling,
    Translate
} from '../../core/types';
import type { CustomConfigService } from '../CustomConfigService/CustomConfigService';

// 配置类型定义
interface PropertiesConfig {
    version: string;
    description: string;
    theme: {
        propertyPanelClass: string;
        multiSelectionClass: string;
        idField: {
            className: string;
            label: string;
            readOnly: boolean;
        };
        nameField: {
            className: string;
            label: string;
            readOnly: boolean;
        };
        attributeField: {
            className: string;
            readOnly: boolean;
        };
        saveButton: {
            className: string;
            text: string;
            enabled: boolean;
        };
    };
    fields: {
        [key: string]: any;
    };
    behaviors: {
        autoSave: {
            enabled: boolean;
            delay: number;
            debounce: boolean;
        };
        confirmSave: {
            enabled: boolean;
            title: string;
            message: string;
            confirmText: string;
            cancelText: string;
        };
        showProcessInfo: {
            enabled: boolean;
            message: string;
        };
        multiSelection: {
            enabled: boolean;
            message: string;
        };
    };
    elementTypes: {
        [elementType: string]: {
            enabled: boolean;
            fields?: string[];
            attrOrder?: string[];
            requiredAttrs?: string[];
            reason?: string;
        };
    };
    validation: {
        enabled: boolean;
        rules: {
            [rule: string]: {
                message: string;
            };
        };
        showErrors: boolean;
        errorClass: string;
    };
    i18n: {
        enabled: boolean;
        locale: string;
        messages: {
            [key: string]: string;
        };
    };
    performance: {
        debounceDelay: number;
        updateThrottle: number;
        renderOptimization: boolean;
    };
    extensions: {
        customValidators: any[];
        customRenderers: any[];
        beforeSave: any[];
        afterSave: any[];
    };
    debug: {
        enabled: boolean;
        logChanges: boolean;
        logRenders: boolean;
    };
}


class CustomPropertiesPanel {
    private _eventBus: EventBus;
    private _injector: Injector;
    private _customLogger: CustomLoggerService;
    private _customConfig: CustomConfigService;
    private _layoutConfig: any;
    private _descriptionConfig: any;
    private _tooltipConfig: any;
    private _feelPopupContainer: HTMLElement | undefined;
    private _getFeelPopupLinks: ((id: string) => any[]) | undefined;
    private _container: HTMLElement;

    constructor(config: CustomPropertiesPanelConfig, injector: Injector, eventBus: EventBus, customLogger: CustomLoggerService, customConfig: CustomConfigService) {
        const {
            parent,
            layout: layoutConfig,
            description: descriptionConfig,
            tooltip: tooltipConfig,
            feelPopupContainer,
            getFeelPopupLinks
        } = config || {};
        this._eventBus = eventBus;
        this._injector = injector;
        this._customLogger = customLogger;
        this._customConfig = customConfig;

        this._customLogger.info('CustomPropertiesPanel constructor called', { config, hasInjector: !!injector, hasEventBus: !!eventBus });

        // 使用自定义日志服务输出初始化信息
        this._customLogger.info('CustomPropertiesPanel initialized', { config, hasInjector: !!injector, hasEventBus: !!eventBus });

        this._layoutConfig = layoutConfig;
        this._descriptionConfig = descriptionConfig;
        this._tooltipConfig = tooltipConfig;
        this._feelPopupContainer = feelPopupContainer;
        this._getFeelPopupLinks = getFeelPopupLinks;
        this._container = domify('<div style="height: 100%" tabindex="-1" class="bio-properties-panel-container"></div>');
        eventBus.on('diagram.init', () => {
            this._customLogger.info('diagram.init event fired', { parent });
            this._customLogger.debug('diagram.init parent element', parent);
            if (parent) {
                this.attachTo(parent);
            }
        });
        eventBus.on('diagram.destroy', () => {
            this._customLogger.info('diagram.destroy event fired');
            this.detach();
        });
        eventBus.on('root.added', (event: any) => {
            const {
                element
            } = event;
            this._customLogger.debug('root.added event fired', { elementId: element?.id, elementType: element?.type });
            this._render(element);
        });


    }

    /**
     * Attach the properties panel to a parent node.
     *
     * @param {HTMLElement} container
     */
    attachTo(container: HTMLElement | string): void {
        let element: HTMLElement | null;

        if (!container) {
            throw new Error('container required');
        }

        // Determine the container element
        if (typeof container === 'string') {
            element = query(container);
        } else {
            // unwrap jQuery if provided
            if ((container as any).get && (container as any).constructor.prototype.jquery) {
                element = (container as any).get(0);
            } else {
                element = container;
            }
        }

        if (!element) {
            throw new Error('container element not found');
        }

        // (1) detach from old parent
        this.detach();

        // (2) append to parent container
        this._customLogger.debug('Attaching properties panel to container', { element, container: this._container });
        element.appendChild(this._container);

        // (3) notify interested parties
        this._eventBus.fire('propertiesPanel.attach');
    }

    /**
     * Detach the properties panel from its parent node.
     */
    detach() {
        const parentNode = this._container.parentNode;
        if (parentNode) {
            parentNode.removeChild(this._container);
            this._eventBus.fire('propertiesPanel.detach');
        }
    }

    /**
     * Register a new properties provider to the properties panel.
     *
     * @param {Number} [priority]
     * @param {PropertiesProvider} provider
     */
    registerProvider(priority: number | Provider, provider?: Provider): void {
        if (!provider) {
            provider = priority as Provider;
            priority = 1000;
        }
        if (typeof provider.getGroups !== 'function') {
            this._customLogger.error('Properties provider does not implement #getGroups(element) API');
            return;
        }
        this._eventBus.on('propertiesPanel.getProviders', function (event: any) {
            event.providers.push(provider);
        }, priority as number);
        this._eventBus.fire('propertiesPanel.providersChanged');
    }

    /**
     * Updates the layout of the properties panel.
     * @param {Object} layout
     */
    setLayout(layout: any): void {
        this._eventBus.fire('propertiesPanel.setLayout', {
            layout
        });
    }
    _getProviders(): Provider[] {
        const event = this._eventBus.createEvent({
            type: 'propertiesPanel.getProviders',
            providers: []
        });
        this._eventBus.fire(event);
        return event.providers;
    }
    _render(element: BpmnElement): void {
        const canvas = this._injector.get('canvas') as Canvas;
        if (!element) {
            element = canvas.getRootElement();
        }

        if (isImplicitRoot(element)) {
            return;
        }
        const root = createRoot(this._container);
        root.render(
            <BpmnPropertiesPanel
                element={element}
                injector={this._injector}
                getProviders={this._getProviders.bind(this)}
                layoutConfig={this._layoutConfig}
                descriptionConfig={this._descriptionConfig}
                tooltipConfig={this._tooltipConfig}
                feelPopupContainer={this._feelPopupContainer}
                getFeelPopupLinks={this._getFeelPopupLinks}
            />
        );

        this._eventBus.fire('propertiesPanel.rendered');
    }
    _destroy() {
        if (this._container) {
            (ReactDOM as any).unmountComponentAtNode(this._container);
            this._eventBus.fire('propertiesPanel.destroyed');
        }
    }
    static $inject = ['config.propertiesPanel', 'injector', 'eventBus', 'customLogger', 'customConfig'];
}

// 导出类
export { CustomPropertiesPanel };

export default {
    __depends__: [CustomLoggerModule, CustomConfigModule],
    __init__: ['propertiesPanel'],
    propertiesPanel: ['type', CustomPropertiesPanel]
};


function isImplicitRoot(element: BpmnElement): boolean { return element && (element as any).isImplicit; }

function findElement(elements: BpmnElement[], element: BpmnElement) { return find(elements, (e: BpmnElement) => e === element); }

function elementExists(element: BpmnElement, elementRegistry: any) { return element && elementRegistry.get(element.id); }

// Static logger instance for React components
const logger = new CustomLoggerService();
function BpmnPropertiesPanel(props: BpmnPropertiesPanelProps) {
    const {
        element,
        injector,
        getProviders,
        layoutConfig: initialLayoutConfig,
        descriptionConfig,
        tooltipConfig,
        feelPopupContainer,
        getFeelPopupLinks
    } = props;
    const canvas = injector.get('canvas') as Canvas;
    const elementRegistry = injector.get('elementRegistry') as ElementRegistry;
    const eventBus = injector.get('eventBus') as EventBus;
    const modeling = injector.get('modeling') as Modeling;
    const translate = injector.get('translate') as Translate;
    const customConfig = injector.get('customConfig') as CustomConfigService;
    const [state, setState] = useState<BpmnPropertiesPanelState>({
        selectedElement: element
    });
    const selectedElement = state.selectedElement;

    useEffect(() => {
        logger.debug('BpmnPropertiesPanel props', props);
    }, [])

    /**
     * @param {djs.model.Base | Array < djs.model.Base >} element
                */
    const _update = (element: BpmnElement | BpmnElement[]) => {
        logger.debug('_update called', element);
        if (!element) {
            return;
        }
        let newSelectedElement = element;

        // handle labels
        if (newSelectedElement && !Array.isArray(newSelectedElement) && newSelectedElement.type === 'label') {
            newSelectedElement = newSelectedElement.labelTarget;
        }
        setState({
            ...state,
            selectedElement: newSelectedElement
        });

        // notify interested parties on property panel updates
        eventBus.fire('propertiesPanel.updated', {
            element: newSelectedElement
        });
    };


    // (2) react on element changes

    // (2a) selection changed
    useEffect(() => {
        const onSelectionChanged = (e: any) => {
            logger.debug('selection.changed event', e);
            const {
                newSelection = []
            } = e;
            if (newSelection.length > 1) {
                return _update(newSelection);
            }
            const newElement = newSelection[0];
            const rootElement = canvas.getRootElement();
            if (isImplicitRoot(rootElement)) {
                return;
            }
            _update(newElement || rootElement);
        };
        eventBus.on('selection.changed', onSelectionChanged);
        return () => {
            eventBus.off('selection.changed', onSelectionChanged);
        };
    }, []);

    // (2b) selected element changed
    useEffect(() => {
        const onElementsChanged = (e: any) => {
            const elements = e.elements;
            // @ts-ignore
            const updatedElement = findElement(elements, selectedElement);
            if (updatedElement && elementExists(updatedElement, elementRegistry)) {
                _update(updatedElement);
            }
        };
        eventBus.on('elements.changed', onElementsChanged);
        return () => {
            eventBus.off('elements.changed', onElementsChanged);
        };
    }, [selectedElement]);

    // (2c) root element changed
    useEffect(() => {
        const onRootAdded = (e: any) => {
            const element = e.element;
            _update(element);
        };
        eventBus.on('root.added', onRootAdded);
        return () => {
            eventBus.off('root.added', onRootAdded);
        };
    }, [selectedElement]);


    {
        // (2d) provided entries changed
        useEffect(() => {
            const onProvidersChanged = () => {
                _update(selectedElement);
            };
            eventBus.on('propertiesPanel.providersChanged', onProvidersChanged);
            return () => {
                eventBus.off('propertiesPanel.providersChanged', onProvidersChanged);
            };
        }, [selectedElement]);

        // (2e) element templates changed
        useEffect(() => {
            const onTemplatesChanged = () => {
                _update(selectedElement);
            };
            eventBus.on('elementTemplates.changed', onTemplatesChanged);
            return () => {
                eventBus.off('elementTemplates.changed', onTemplatesChanged);
            };
        }, [selectedElement]);

        // (3) create properties panel context
        const bpmnPropertiesPanelContext = {
            selectedElement,
            injector,
            getService(type: string, strict?: boolean) {
                return injector.get(type, strict);
            }
        };

        // (4) retrieve groups for selected element
        const providers = getProviders(selectedElement);
        const groups = useMemo(() => {
            return reduce(providers, function (groups: any[], provider: Provider) {
                // do not collect groups for multi element state
                if (isArray(selectedElement)) {
                    return [];
                }
                const updater = provider.getGroups(selectedElement);
                return updater(groups);
            }, []);
        }, [providers, selectedElement]);

        // (5) notify layout changes
        const [layoutConfig, setLayoutConfig] = useState(initialLayoutConfig || {});
        const onLayoutChanged = useCallback((newLayout: any) => {
            eventBus.fire('propertiesPanel.layoutChanged', {
                layout: newLayout
            });
        }, [eventBus]);

        // React to external layout changes
        useEffect(() => {
            const cb = (e: any) => {
                const {
                    layout
                } = e;
                setLayoutConfig(layout);
            };
            eventBus.on('propertiesPanel.setLayout', cb);
            return () => eventBus.off('propertiesPanel.setLayout', cb);
        }, [eventBus, setLayoutConfig]);

        // (6) notify description changes
        const onDescriptionLoaded = (description: any) => {
            eventBus.fire('propertiesPanel.descriptionLoaded', {
                description
            });
        };

        // (7) notify tooltip changes
        const onTooltipLoaded = (tooltip: any) => {
            eventBus.fire('propertiesPanel.tooltipLoaded', {
                tooltip
            });
        };
    }
    return <div className='bpmn-properties-panel'>
        {Array.isArray(state.selectedElement) ? (
            <div className="multi-selection-notice">
                <span>Multiple elements selected - please select a single element to edit properties</span>
            </div>
        ) : (
            <PanelBox key={state.selectedElement.id} selectedElement={state.selectedElement} modeling={modeling} eventBus={eventBus} customConfig={customConfig} />
        )}
    </div>
}
const PanelBox = (props: PanelBoxProps) => {
    const { selectedElement, modeling, eventBus, customConfig } = props

    // 获取配置 - 使用配置服务
    const config = customConfig?.getConfig() || {};

    // 检查元素类型是否启用
    const elementTypeConfig = (config.elementTypes?.[selectedElement.type!]) || config.elementTypes?.default || {
        enabled: true,
        fields: ['id', 'name', 'attrs']
    };

    // 检查是否为进程类型
    const isProcess = useMemo(() => selectedElement.type === "bpmn:Process", [selectedElement.type]);

    // 检查元素是否启用
    const isEnabled = elementTypeConfig.enabled;

    // 使用配置驱动的行为
    const behaviors = config.behaviors;
    const theme = config.theme;
    const i18n = config.i18n;

    // 获取国际化消息 - 使用i18next
    const getMessage = (key: string): string => {
        if (key === 'processMessage') {
            return BpmnTranslations.getPanelMessage('pleaseSelectElement');
        }
        if (key === 'multiSelectionMessage') {
            return BpmnTranslations.getPanelMessage('multipleElementsSelected');
        }
        if (key === 'save') {
            return BpmnTranslations.getDialogTranslation('confirmSave', 'confirmText');
        }
        // 对于BPMN字段标签，使用专用翻译工具
        if ((config.fields.attrs.properties && key in config.fields.attrs.properties) || ['id', 'name'].includes(key)) {
            return BpmnTranslations.getFieldTranslation(key as string);
        }
        // 其他消息使用通用翻译
        const translatedMsg = LanguageManager.t(key);
        return translatedMsg !== key ? translatedMsg : key;
    };

    if (!selectedElement.businessObject) return <></>

    // 如果元素类型未启用，返回空
    if (!isEnabled) {
        return <div className={theme.propertyPanelClass}>
            <span className='text-gray-500'>
                {elementTypeConfig.reason || BpmnTranslations.getPanelMessage('pleaseSelectElement')}
            </span>
        </div>
    }

    const [_businessObject, setBusinessObject] = useState(selectedElement.businessObject)
    const [record, setRecord] = useState<any>(null)

    // 使用防抖的保存逻辑
    const debouncedSave = useMemo(() => {
        let timeout: NodeJS.Timeout;
        return (data: any) => {
            if (behaviors.autoSave.enabled) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    modeling.updateProperties(selectedElement, data);
                    if (config.debug.logChanges) {
                        logger.info('AutoSave applied', data);
                    }
                }, behaviors.autoSave.delay);
            }
        };
    }, [behaviors.autoSave, modeling, selectedElement, config.debug]);

    useUnmount(() => {
        if (config.debug.enabled) {
            logger.debug("Component unmounting with latest values", { businessObject: _businessObject, isProcess });
        }

        if (!isProcess && !!record) {
            // 使用配置化的确认对话框
            if (behaviors.confirmSave.enabled) {
                showModal({
                    title: behaviors.confirmSave.title,
                    message: behaviors.confirmSave.message,
                    confirmText: behaviors.confirmSave.confirmText,
                    cancelText: behaviors.confirmSave.cancelText,
                }).then((ok) => {
                    if (ok) {
                        saveChanges();
                    }
                })
            } else {
                saveChanges();
            }
        }
    }, [_businessObject]);

    const saveChanges = () => {
        const {
            $attrs: attrs,
            $type: type,
            id,
            sourceRef,
            targetRef,
            eventDefinitions,
            name,
            ...data
        } = _businessObject ?? {};
        modeling.updateProperties(selectedElement, { ...attrs, name });

        if (config.debug.logChanges) {
            logger.info('ManualSave applied', { ...attrs, name });
        }
    };

    const updateName = (name: string) => {
        if (behaviors.autoSave.enabled) {
            debouncedSave({ name });
        }
        setRecord((prev: any) => ({ ...(prev || {}), name }))
        setBusinessObject((prev: any) => ({ ...(prev || {}), name }))
    }

    const updateAttr = (key: string, value: string) => {
        if (behaviors.autoSave.enabled) {
            debouncedSave({ ...(record?.$attrs || {}), [key]: value });
        }
        setRecord((prev: any) => ({ ...(prev || {}), $attrs: { ...(prev?.$attrs || {}), [key]: value } }))
        setBusinessObject((prev: any) => ({ ...(prev || {}), $attrs: { ...(prev?.$attrs || {}), [key]: value } }))
    }

    // 渲染字段组件
    const renderField = (fieldKey: string, fieldConfig: any, value: any, onChange: (value: string) => void) => {
        if (!fieldConfig?.enabled && fieldConfig?.visible === false) return null;

        const fieldClass = fieldConfig?.className || theme.attributeField.className;
        const label = fieldConfig?.label || fieldKey;
        const readOnly = fieldConfig?.readOnly !== undefined ? fieldConfig.readOnly : false;

        return (
            <div key={fieldKey} className={`space-y-2 flex items-center gap-[10px] ${fieldClass}`}>
                <label className='block text-sm font-medium text-gray-700'>{getMessage(label)}</label>
                {renderInputComponent(fieldConfig, value, onChange, { readOnly })}
            </div>
        );
    };

    // 根据配置渲染输入组件
    const renderInputComponent = (fieldConfig: any, value: any, onChange: (value: string) => void, extraProps: any = {}) => {
        const { type = 'text', placeholder, options, ...fieldProps } = fieldConfig;

        switch (type) {
            case 'select':
                return (
                    <Select
                        {...extraProps}
                        {...fieldProps}
                        value={value}
                        onChange={onChange}
                        options={options?.map((opt: any) => ({ value: opt.value, label: opt.label })) || []}
                    />
                );
            case 'textarea':
                return (
                    <Input
                        {...extraProps}
                        {...fieldProps}
                        as="textarea"
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}
                    />
                );
            default:
                return (
                    <Input
                        {...extraProps}
                        {...fieldProps}
                        type={type}
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}
                    />
                );
        }
    };

    // 获取显示字段列表
    const getDisplayFields = () => {
        const fields = elementTypeConfig.fields || ['id', 'name', 'attrs'];
        return fields;
    };

    // 获取排序后的属性列表
    const getSortedAttrs = useCallback(() => {
        const attrOrder = elementTypeConfig.attrOrder || [];
        const existingAttrs = Object.keys(_businessObject.$attrs || {});
        const sortedAttrs = [...attrOrder];

        // 添加未在排序列表中的属性
        existingAttrs.forEach(attr => {
            if (!sortedAttrs.includes(attr)) {
                sortedAttrs.push(attr);
            }
        });

        // 安全检查：确保 config.fields.attrs.properties 存在
        const properties = config.fields?.attrs?.properties || {};

        return sortedAttrs.filter(attr => properties[attr]?.enabled !== false);
    },[_businessObject]);

    if (config.debug.logRenders) {
        logger.info('PanelBox Render', {
            elementType: selectedElement.type,
            isProcess,
            displayFields: getDisplayFields(),
            attrs: getSortedAttrs()
        });
    }

    return (
        <div className={theme.propertyPanelClass}>
            {isProcess ? (
                <span className='text-gray-500'>{getMessage('processMessage')}</span>
            ) : (
                <>
                    {/* 动态渲染字段 */}
                    {getDisplayFields().map((fieldKey: string) => {
                        switch (fieldKey) {
                            case 'id':
                                return renderField('id', theme.idField, selectedElement.id, () => { });
                            case 'name':
                                return renderField('name', theme.nameField, _businessObject.name || "", updateName);
                            case 'attrs':
                                // 渲染属性字段
                                return getSortedAttrs().map(attrKey => {
                                    // 安全检查：确保 config.fields.attrs.properties 存在
                                    const properties = config.fields?.attrs?.properties || {};
                                    const attrConfig = properties[attrKey] ||
                                        { type: 'text', enabled: true, label: attrKey };

                                    // 确保属性值是字符串，智能处理对象类型
                                    const attrValue = _businessObject.$attrs?.[attrKey];
                                    let displayValue = "";

                                    if (attrValue === null || attrValue === undefined) {
                                        displayValue = "";
                                    } else if (typeof attrValue === 'string') {
                                        displayValue = attrValue;
                                    } else if (typeof attrValue === 'object') {
                                        // 对于对象类型，尝试提取有意义的显示值
                                        if (attrValue.name) {
                                            displayValue = attrValue.name;
                                        } else if (attrValue.id) {
                                            displayValue = attrValue.id;
                                        } else if (attrValue.value) {
                                            displayValue = attrValue.value;
                                        } else {
                                            // 如果没有有意义的字段，显示类型信息
                                            displayValue = `[${attrValue.constructor?.name || 'Object'}]`;
                                        }
                                    } else {
                                        displayValue = String(attrValue);
                                    }

                                    return renderField(
                                        attrKey,
                                        attrConfig,
                                        displayValue,
                                        (value) => updateAttr(attrKey, value)
                                    );
                                });
                            default:
                                return null;
                        }
                    })}

                    {/* 保存按钮 */}
                    {!behaviors.autoSave.enabled && theme.saveButton.enabled && (
                        <div className={`pt-4 ${theme.saveButton.className}`}>
                            <Button onClick={saveChanges}>
                                {getMessage(theme.saveButton.text)}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
