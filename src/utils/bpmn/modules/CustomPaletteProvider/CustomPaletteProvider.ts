import { assign } from 'min-dash';
import GlobalConnectModule from 'diagram-js/lib/features/global-connect';
import type { Injector, EventBus } from '../../core/types';
import { CustomLoggerService } from '../CustomLoggerService/CustomLoggerService';
import CustomLoggerModule from '../CustomLoggerService/CustomLoggerService';
import BpmnElementFactoryModule from '../../utils/bpmnElementFactory';
import type { BusinessOptions, BpmnElementFactory } from '../../utils/bpmnElementFactory';

// 自定义调色板类型定义
interface Palette {
    registerProvider(provider: any): void;
    _rebuild(): void;
}

interface Create {
    start(event: any, shape: any): void;
}

interface ElementFactory {
    createShape(options: any): any;
}

interface Tool {
    activateSelection?(event: any): void;
    start?(event: any): void;
}

interface Translate {
    (key: string, params?: any): string;
}

interface PaletteEntries {
    [key: string]: {
        group?: string;
        className?: string;
        title?: string;
        separator?: boolean;
        action?: {
            click?: (event: any) => void;
            dragstart?: (event: any) => void;
        };
    };
}






class CustomPaletteProvider {
    private _palette: Palette;
    private _create: Create;
    private _elementFactory: ElementFactory;
    private _spaceTool?: Tool;
    private _lassoTool?: Tool;
    private _handTool?: Tool;
    private _globalConnect?: Tool;
    private _translate: Translate;
    private _businessCustomOptions: BusinessOptions = {};
    private _logger: CustomLoggerService;
    private _bpmnElementFactory: BpmnElementFactory;

    static $inject = [
        'palette',
        'create',
        'elementFactory',
        'spaceTool',
        'lassoTool',
        'handTool',
        'globalConnect',
        'translate',
        'eventBus',
        'customLogger',
        'bpmnElementFactory'
    ]

    constructor(
        palette: Palette,
        create: Create,
        elementFactory: ElementFactory,
        spaceTool: Tool,
        lassoTool: Tool,
        handTool: Tool,
        globalConnect: Tool,
        translate: Translate,
        eventBus: EventBus,
        customLogger: CustomLoggerService,
        bpmnElementFactory: BpmnElementFactory
    ) {
        this._palette = palette;
        this._create = create;
        this._elementFactory = elementFactory;
        this._spaceTool = spaceTool;
        this._lassoTool = lassoTool;
        this._handTool = handTool;
        this._globalConnect = globalConnect;
        this._translate = translate;
        this._logger = customLogger;
        this._bpmnElementFactory = bpmnElementFactory;

        this._logger.debug('CustomPaletteProvider initialized', { palette, lassoTool });
        palette.registerProvider(this);
        eventBus.on('root.updateBusiness', (e: any) => {
            this._logger.info('Business update received', e);
            const { type, ...businessObject } = e;
            this._businessCustomOptions = {
                ...this._businessCustomOptions,
                ...businessObject
            };
            palette._rebuild();
        });
    }

    /**
     * @return {PaletteEntries}
     */
    getPaletteEntries() {
        const {
            _create: create,
            _elementFactory: elementFactory,
            _spaceTool: spaceTool,
            _lassoTool: lassoTool,
            _handTool: handTool,
            _globalConnect: globalConnect,
            _translate: translate,
            _businessCustomOptions: businessCustomOptions
        } = this;
        const actions = {};

        const createAction = (type: string, group: string, className: string, title?: string, options?: any) => {
            return this._bpmnElementFactory.createPaletteAction(
                type,
                group,
                className,
                title,
                options,
                businessCustomOptions
            );
        };
        assign(actions, {
            'lasso-tool': {
                group: 'tools',
                className: 'bpmn-icon-lasso-tool',
                title: translate('Activate the lasso tool'),
                action: {
                    click: function (event: any) {
                        lassoTool?.activateSelection?.(event);
                    }
                }
            },
            'global-connect-tool': {
                group: 'tools',
                className: 'bpmn-icon-connection-multi',
                title: translate('Activate the global connect tool'),
                action: {
                    click: function (event: any) {
                        globalConnect?.start?.(event);
                    }
                }
            },
            'tool-separator': {
                group: 'tools',
                separator: true
            },
            'create.start-event': createAction(
                'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none', undefined, undefined
            ),
            'create.userTask': createAction(
                'bpmn:UserTask', 'activity', 'bpmn-icon-user-task', undefined, undefined
            ),
            'create.exclusive-gateway': createAction(
                'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-xor', undefined, undefined
            ),
            'create.parallel-gateway': createAction(
                'bpmn:ParallelGateway', 'gateway', 'bpmn-icon-gateway-parallel', undefined, undefined
            ),
            'create.end-event': createAction(
                'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none', undefined, undefined
            ),
        });

        this._logger.info('[getPaletteEntries]actions', actions);
        return actions;
    }
}


export default {
    __init__: [
        'paletteProvider',
    ],
    // __depends__: [GlobalConnectModule, CustomLassoTool],
    __depends__: [GlobalConnectModule, CustomLoggerModule, BpmnElementFactoryModule],
    paletteProvider: ['type', CustomPaletteProvider]
};
