import { domify, query } from 'min-dom'
import { reduce, isArray, find, set } from 'min-dash'
import { showModal } from '@/utils'
import { useUnmount } from '@/utils/useHooks'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';

// Type definitions for CustomPropertiesPanel
interface CustomPropertiesPanelConfig {
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
    getFeelPopupLinks?: () => any;
}

interface PropertiesProvider {
    getGroups(element: any): (groups: any[]) => any[];
}

interface BpmnElement {
    id: string;
    type: string;
    businessObject?: {
        id?: string;
        name?: string;
        $type?: string;
        $attrs?: Record<string, any>;
        [key: string]: any;
    };
    labelTarget?: any;
    [key: string]: any;
}

interface Injector {
    get<T>(serviceType: string, strict?: boolean): T;
}

interface EventBus {
    on(event: string, priority?: number, callback?: Function): void;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    fire<T extends Record<string, any>>(event: string | T, data?: T): void;
    createEvent<T extends Record<string, any>>(data: T): Event & T;
}

interface Canvas {
    getRootElement(): BpmnElement;
}

interface ElementRegistry {
    get(id: string): BpmnElement | undefined;
}

interface Modeling {
    updateProperties(element: BpmnElement, properties: Record<string, any>): void;
}

interface Translate {
    (key: string, options?: Record<string, any>): string;
}

interface LayoutConfig {
    groups?: any[];
    open?: boolean;
    [key: string]: any;
}

interface DescriptionConfig {
    [key: string]: string;
}

interface TooltipConfig {
    [key: string]: string;
}

interface BpmnPropertiesPanelProps {
    element: BpmnElement;
    injector: Injector;
    getProviders: (element?: BpmnElement) => PropertiesProvider[];
    layoutConfig?: LayoutConfig;
    descriptionConfig?: DescriptionConfig;
    tooltipConfig?: TooltipConfig;
    feelPopupContainer?: HTMLElement;
    getFeelPopupLinks?: () => any;
}

interface BusinessObject {
    id: string;
    name?: string;
    $type: string;
    $attrs?: Record<string, any>;
    sourceRef?: any;
    targetRef?: any;
    eventDefinitions?: any[];
    [key: string]: any;
}

interface BpmnPropertiesPanelState {
    selectedElement: BpmnElement;
}

interface PanelBoxProps {
    selectedElement: BpmnElement;
    modeling: Modeling;
    eventBus: EventBus;
}

interface PanelBoxState {
    businessObject: BusinessObject | null;
    record: Record<string, any> | null;
}

class CustomPropertiesPanel {
    private _eventBus: EventBus;
    private _injector: Injector;
    private _layoutConfig?: LayoutConfig;
    private _descriptionConfig?: DescriptionConfig;
    private _tooltipConfig?: TooltipConfig;
    private _feelPopupContainer?: HTMLElement;
    private _getFeelPopupLinks?: () => any;
    private _container: HTMLElement;

    constructor(config: CustomPropertiesPanelConfig, injector: Injector, eventBus: EventBus) {
        const {
            parent,
            layout: layoutConfig,
            description: descriptionConfig,
            tooltip: tooltipConfig,
            feelPopupContainer,
            getFeelPopupLinks
        } = config || {};
        console.log('[CustomPropertiesPanel]', { config, injector, eventBus })
        this._eventBus = eventBus;
        this._injector = injector;
        this._layoutConfig = layoutConfig;
        this._descriptionConfig = descriptionConfig;
        this._tooltipConfig = tooltipConfig;
        this._feelPopupContainer = feelPopupContainer;
        this._getFeelPopupLinks = getFeelPopupLinks;
        this._container = domify('<div style="height: 100%" tabindex="-1" class="bio-properties-panel-container"></div>');
        eventBus.on('diagram.init', () => {
            console.log('[CustomPropertiesPanel] diagram.init', parent)
            if (parent) {
                this.attachTo(parent);
            }
        });
        eventBus.on('diagram.destroy', () => {
            this.detach();
        });
        eventBus.on('root.added', (event: { element: BpmnElement }) => {
            const {
                element
            } = event;
            this._render(element);
        });

    }
    attachTo(container: string | HTMLElement | any): void {
        if (!container) {
            throw new Error('container required');
        }

        if (container.get && container.constructor.prototype.jquery) {
            container = container.get(0);
        }
        if (typeof container === 'string') {
            container = query(container);
        }

        this.detach();

        console.log('[attachTo]', container, this._container)
        container.appendChild(this._container);

        this._eventBus.fire('propertiesPanel.attach');
    }

    detach(): void {
        const parentNode = this._container.parentNode;
        if (parentNode) {
            parentNode.removeChild(this._container);
            this._eventBus.fire('propertiesPanel.detach');
        }
    }

    registerProvider(priority?: number, provider?: PropertiesProvider): void {
        if (!provider) {
            provider = priority as any;
            priority = 1000;
        }
        if (typeof provider?.getGroups !== 'function') {
            console.error('Properties provider does not implement #getGroups(element) API');
            return;
        }
        this._eventBus.on('propertiesPanel.getProviders', priority, function (event: any) {
            event.providers.push(provider);
        });
        this._eventBus.fire('propertiesPanel.providersChanged');
    }

    setLayout(layout: any): void {
        this._eventBus.fire('propertiesPanel.setLayout', {
            layout
        });
    }
    _getProviders(): PropertiesProvider[] {
        const event = this._eventBus.createEvent({
            type: 'propertiesPanel.getProviders',
            providers: []
        });
        this._eventBus.fire(event);
        return event.providers;
    }
    _render(element?: BpmnElement): void {
        const canvas: Canvas = this._injector.get('canvas');
        if (!element) {
            element = canvas.getRootElement();
        }

        if (isImplicitRoot(element)) {
            return;
        }

        try {
            // 尝试使用 React 18+ 的 createRoot API
            const createRoot = (ReactDOM as any).createRoot;
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
            (this._container as any)._reactRoot = root;
        } catch (error) {
            // 如果 createRoot 不存在，则使用传统的 render 方法
            console.warn('ReactDOM.createRoot not available, falling back to render');
            (ReactDOM as any).render(
                <BpmnPropertiesPanel
                    element={element}
                    injector={this._injector}
                    getProviders={this._getProviders.bind(this)}
                    layoutConfig={this._layoutConfig}
                    descriptionConfig={this._descriptionConfig}
                    tooltipConfig={this._tooltipConfig}
                    feelPopupContainer={this._feelPopupContainer}
                    getFeelPopupLinks={this._getFeelPopupLinks}
                />,
                this._container
            );
            (this._container as any)._reactRoot = null;
        }

        this._eventBus.fire('propertiesPanel.rendered');
    }

    _destroy(): void {
        if (this._container) {
            const root = (this._container as any)._reactRoot;
            try {
                if (root && typeof root.unmount === 'function') {
                    root.unmount();
                } else {
                    // 降级到传统的卸载方法
                    (ReactDOM as any).unmountComponentAtNode(this._container);
                }
            } finally {
                (this._container as any)._reactRoot = undefined;
                this._eventBus.fire('propertiesPanel.destroyed');
            }
        }
    }
    static $inject = ['config.propertiesPanel', 'injector', 'eventBus']
}

export default {
    __depends__: [],
    __init__: ['propertiesPanel'],
    propertiesPanel: ['type', CustomPropertiesPanel]
};


function isImplicitRoot(element: BpmnElement): boolean {
    return (element as any) && element.isImplicit;
}

function findElement(elements: BpmnElement[], element: BpmnElement): BpmnElement | undefined {
    return find(elements, (e: any) => e === element);
}

function elementExists(element: BpmnElement, elementRegistry: ElementRegistry): boolean {
    return (element as any) && elementRegistry.get(element.id);
}

const BpmnPropertiesPanel: React.FC<BpmnPropertiesPanelProps> = (props: BpmnPropertiesPanelProps) => {
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
    const canvas = injector.get('canvas') as any;
    const elementRegistry = injector.get('elementRegistry') as any;
    const eventBus = injector.get('eventBus') as any;
    const modeling = injector.get('modeling') as any;
    const translate = injector.get('translate') as any;
    const [state, setState] = useState({
        selectedElement: element
    });
    const selectedElement = state.selectedElement;

    useEffect(() => {
        console.log('[BpmnPropertiesPanel]props', props)
    }, [])

    const _update = (element: any) => {
        console.log('_update', element)
        if (!element) {
            return;
        }
        let newSelectedElement = element;

        // handle labels
        if (newSelectedElement && newSelectedElement.type === 'label') {
            newSelectedElement = newSelectedElement.labelTarget;
        }
        setState({
            ...state,
            selectedElement: newSelectedElement
        });

        eventBus.fire('propertiesPanel.updated', {
            element: newSelectedElement
        });
    };


    useEffect(() => {
        const onSelectionChanged = (e: any) => {
            console.log('[selection.changed]', e)
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

    useEffect(() => {
        const onElementsChanged = (e: any) => {
            const elements = e.elements;
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

    useEffect(() => {
        const onRootAdded = (e: any) => {
            const { element } = e;
            _update(element);
        };
        eventBus.on('root.added', onRootAdded);
        return () => {
            eventBus.off('root.added', onRootAdded);
        };
    }, [selectedElement]);

    useEffect(() => {
        const onProvidersChanged = () => {
            _update(selectedElement);
        };
        eventBus.on('propertiesPanel.providersChanged', onProvidersChanged);
        return () => {
            eventBus.off('propertiesPanel.providersChanged', onProvidersChanged);
        };
    }, [selectedElement]);

    useEffect(() => {
        const onTemplatesChanged = () => {
            _update(selectedElement);
        };
        eventBus.on('elementTemplates.changed', onTemplatesChanged);
        return () => {
            eventBus.off('elementTemplates.changed', onTemplatesChanged);
        };
    }, [selectedElement]);

    const bpmnPropertiesPanelContext = {
        selectedElement,
        injector,
        getService(type: string, strict: any) {
            return injector.get(type, strict);
        }
    };

    const providers = getProviders(selectedElement);
    const groups = useMemo(() => {
        return reduce(providers, (groups: any, provider) => {
            if (isArray(selectedElement)) {
                return [];
            }
            const updater = provider.getGroups(selectedElement);
            return updater(groups);
        }, []);
    }, [providers, selectedElement]);

    const [layoutConfig, setLayoutConfig] = useState(initialLayoutConfig || {});
    const onLayoutChanged = useCallback((newLayout: any) => {
        eventBus.fire('propertiesPanel.layoutChanged', {
            layout: newLayout
        });
    }, [eventBus]);

    useEffect(() => {
        const cb = (e: { layout?: LayoutConfig }) => {
            const { layout } = e;
            setLayoutConfig(layout || {});
        };
        eventBus.on('propertiesPanel.setLayout', cb);
        return () => eventBus.off('propertiesPanel.setLayout', cb);
    }, [eventBus, setLayoutConfig]);

    const onDescriptionLoaded = (description: any) => {
        eventBus.fire('propertiesPanel.descriptionLoaded', {
            description
        });
    };

    const onTooltipLoaded = (tooltip: any) => {
        eventBus.fire('propertiesPanel.tooltipLoaded', {
            tooltip
        });
    };

    return (
        <div className='bpmn-properties-panel' >
            <PanelBox
                key={state.selectedElement.id}
                selectedElement={state.selectedElement}
                modeling={modeling}
                eventBus={eventBus}
            />
        </div>
    );
}

const PanelBox: React.FC<PanelBoxProps> = (props: PanelBoxProps) => {
    const { selectedElement, modeling, eventBus } = props
    const _process = useMemo(() => selectedElement.type === "bpmn:Process", [selectedElement.type])
    if (!selectedElement.businessObject) return null
    const [_businessObject, setBusinessObject] = useState(selectedElement.businessObject)
    const [record, setRecord] = useState<{ [key: string]: string } | null>(null)
    useUnmount(() => {
        console.log("卸载时拿到最新的值:", _businessObject, _process);
        if (!_process && !!record)
            showModal({
                title: "提示",
                message: "是否更新修改",
                confirmText: "确认",
                cancelText: "取消",
            }).then((ok) => {
                if (ok) {
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
                    modeling.updateProperties(selectedElement, { ...attrs, name })
                }
            })
    }, [_businessObject]);
    const updateName = (name: string) => {
        setRecord((prev) => ({ ...prev, name }))
        setBusinessObject((prev) => ({ ...prev, name }))
    }
    const updateAttr = (key: string, value: string) => {
        // @ts-ignore
        setRecord((prev) => ({ ...prev, $attrs: { ...prev.$attrs, [key]: value } }))
        setBusinessObject((prev) => ({ ...prev, $attrs: { ...prev.$attrs, [key]: value } }))
    }
    return (
        <div className='bio-properties-panel-input-box' >
            {
                _process ? (
                    <span> Please select an element.</span>
                ) : (
                    <>
                        <div className='id' >
                            <label>id </label>
                            < input value={selectedElement.id} readOnly />
                        </div>
                        < div className='name' >
                            <label>name </label>
                            < input
                                value={_businessObject.name || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    let value = e?.target?.value;
                                    if (value) updateName(value);
                                }}
                            />
                        </div>
                        {
                            Object.keys(_businessObject.$attrs || {}).map((key: string) => (
                                <div key={key} className='attr' >
                                    <label>{key} </label>
                                    <input
                                        value={_businessObject?.['$attrs']?.[key] || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            let value = e?.target?.value;
                                            if (value) updateAttr(key, value);
                                        }}
                                    />
                                </div>
                            ))}
                        <div className='save-button' >
                            save
                        </div>
                    </>
                )}
        </div>
    );
}
