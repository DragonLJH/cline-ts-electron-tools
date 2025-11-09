import { domify, query } from 'min-dom'
import { reduce, isArray, find, set } from 'min-dash'
import { showModal } from '@/utils'
import { useUnmount } from '@/utils/useHooks'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/Commom'
import { Input } from '@/components/Input'
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
} from '../types';


class CustomPropertiesPanel {
    private _eventBus: EventBus;
    private _injector: Injector;
    private _layoutConfig: any;
    private _descriptionConfig: any;
    private _tooltipConfig: any;
    private _feelPopupContainer: HTMLElement | undefined;
    private _getFeelPopupLinks: ((id: string) => any[]) | undefined;
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
        eventBus.on('root.added', (event: any) => {
            const {
                element
            } = event;
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
        console.log('[attachTo]', element, this._container)
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
            console.error('Properties provider does not implement #getGroups(element) API');
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
    static $inject = ['config.propertiesPanel', 'injector', 'eventBus'];
}

// 导出类
export { CustomPropertiesPanel };

export default {
    __depends__: [],
    __init__: ['propertiesPanel'],
    propertiesPanel: ['type', CustomPropertiesPanel]
};


function isImplicitRoot(element: BpmnElement): boolean { return element && (element as any).isImplicit; }

function findElement(elements: BpmnElement[], element: BpmnElement) { return find(elements, (e: BpmnElement) => e === element); }

function elementExists(element: BpmnElement, elementRegistry: any) { return element && elementRegistry.get(element.id); }
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
    const [state, setState] = useState<BpmnPropertiesPanelState>({
        selectedElement: element
    });
    const selectedElement = state.selectedElement;

    useEffect(() => {
        console.log('[BpmnPropertiesPanel]props', props)
    }, [])

    /**
     * @param {djs.model.Base | Array < djs.model.Base >} element
                */
    const _update = (element: BpmnElement | BpmnElement[]) => {
        console.log('_update', element)
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
            <PanelBox key={state.selectedElement.id} selectedElement={state.selectedElement} modeling={modeling} eventBus={eventBus} />
        )}
    </div>
}
const PanelBox = (props: PanelBoxProps) => {
    const { selectedElement, modeling, eventBus } = props
    const _process = useMemo(() => selectedElement.type === "bpmn:Process", [selectedElement.type])
    if (!selectedElement.businessObject) return <></>
    const [_businessObject, setBusinessObject] = useState(selectedElement.businessObject)
    const [record, setRecord] = useState(null)
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
        setRecord((prev: any) => ({ ...(prev || {}), name }))
        setBusinessObject((prev: any) => ({ ...(prev || {}), name }))
    }
    const updateAttr = (key: string, value: string) => {
        setRecord((prev: any) => ({ ...(prev || {}), $attrs: { ...(prev?.$attrs || {}), [key]: value } }))
        setBusinessObject((prev: any) => ({ ...(prev || {}), $attrs: { ...(prev?.$attrs || {}), [key]: value } }))
    }
    return (<div className='p-4 space-y-4'>
        {_process ? <span className='text-gray-500'>Please select an element.</span> : <>
            <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>id</label>
                <Input value={selectedElement.id} readOnly />
            </div>
            <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>name</label>
                <Input value={_businessObject.name || ""} onChange={(e) => {
                    let value = e?.target?.value
                    if (value) updateName(value)
                }} />
            </div>
            {
                Object.keys(_businessObject.$attrs || {}).map((key) => {
                    return <div key={key} className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>{key}</label>
                        <Input value={_businessObject.$attrs[key]} onChange={(e) => {
                            let value = e?.target?.value
                            if (value) updateAttr(key, value)
                        }} />
                    </div>
                })
            }
            <div className='pt-4'>
                <Button onClick={() => {
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
                }}>
                    保存
                </Button>
            </div>
        </>}
    </div>)
}
