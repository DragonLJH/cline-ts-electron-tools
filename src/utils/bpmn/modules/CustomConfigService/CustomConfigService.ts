import { CustomLoggerService } from '../CustomLoggerService/CustomLoggerService';
import CustomLoggerModule from '../CustomLoggerService/CustomLoggerService';

// 默认配置，当远程加载失败时使用
const DEFAULT_CONFIG_JSON = {
    "version": "1.0.0",
    "description": "BPMN属性面板配置",

    "theme": {
        "propertyPanelClass": "bpmn-properties-panel",
        "idField": {
            "label": "ID",
            "readOnly": true
        },
        "nameField": {
            "label": "名称",
            "readOnly": false
        },
        "attributeField": {
            "readOnly": false
        },
        "saveButton": {
            "text": "保存",
            "enabled": true
        }
    },

    "fields": {
        "id": {
            "enabled": true,
            "label": "ID",
            "type": "text",
            "readOnly": true
        },
        "name": {
            "enabled": true,
            "label": "名称",
            "type": "text",
            "readOnly": false,
            "placeholder": "输入元素名称"
        },
        "attrs": {
            "enabled": true,
            "label": "属性",
            "properties": {
                "assignee": {
                    "type": "text",
                    "label": "负责人",
                    "placeholder": "输入负责人姓名",
                    "defaultValue": "assignee"
                },
                "description": {
                    "type": "textarea",
                    "label": "描述",
                    "placeholder": "输入描述信息",
                    "rows": 3,
                    "defaultValue": "description"
                },
                "priority": {
                    "type": "select",
                    "label": "优先级",
                    "options": [
                        { "value": "low", "label": "低" },
                        { "value": "medium", "label": "中" },
                        { "value": "high", "label": "高" },
                        { "value": "urgent", "label": "紧急" }
                    ],
                    "defaultValue": "medium"
                },
                "category": {
                    "type": "select",
                    "label": "分类",
                    "options": [
                        { "value": "process", "label": "流程" },
                        { "value": "task", "label": "任务" },
                        { "value": "gateway", "label": "网关" },
                        { "value": "event", "label": "事件" }
                    ],
                    "defaultValue": "task"
                }
            }
        }
    },

    "behaviors": {
        "autoSave": {
            "enabled": false,
            "delay": 1000
        },
        "confirmSave": {
            "enabled": true,
            "title": "确认",
            "message": "确定要保存修改吗？",
            "confirmText": "确定",
            "cancelText": "取消"
        }
    },

    "elementTypes": {
        "bpmn:Process": {
            "enabled": false
        },
        "bpmn:StartEvent": {
            "enabled": true,
            "fields": ["id", "name"]
        },
        "bpmn:UserTask": {
            "enabled": true,
            "fields": ["id", "name", "attrs"],
            "attrOrder": ["assignee", "priority", "description"]
        },
        "bpmn:ServiceTask": {
            "enabled": true,
            "fields": ["id", "name", "attrs"],
            "attrOrder": ["category", "description"]
        },
        "bpmn:ExclusiveGateway": {
            "enabled": true,
            "fields": ["id", "name", "attrs"],
            "attrOrder": ["description"]
        },
        "bpmn:ParallelGateway": {
            "enabled": true,
            "fields": ["id", "name", "attrs"],
            "attrOrder": ["description"]
        },
        "bpmn:EndEvent": {
            "enabled": true,
            "fields": ["id", "name"]
        },
        "bpmn:SequenceFlow": {
            "enabled": true,
            "fields": ["id", "name", "attrs"],
            "attrOrder": ["category", "description"]
        },
        "default": {
            "enabled": true,
            "fields": ["id", "name"]
        }
    },

    "i18n": {
        "enabled": true,
        "locale": "zh-CN",
        "messages": {
            "save": "保存",
            "cancel": "取消",
            "confirm": "确认",
            "confirmTitle": "提示",
            "confirmMessage": "确定要保存修改吗？",
            "processMessage": "请选择要编辑的元素",
            "multiSelectionMessage": "选中多个元素，请选择单个元素进行编辑"
        }
    },

    "debug": {
        "enabled": false
    }
}

// 添加加载远程配置的方法
async function loadRemoteConfig(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let text = await response.text();
        try {
            return JSON.parse(text);
        } catch (error) {
            return text
        }
    } catch (error) {
        console.warn('Failed to load remote config, using default:', error);
        return DEFAULT_CONFIG_JSON;
    }
}

export interface PropertiesConfig {
    version: string;
    description: string;
    theme: any;
    fields: any;
    behaviors: any;
    elementTypes: any;
    validation: any;
    i18n: any;
    performance: any;
    extensions: any;
    debug: any;
    [key: string]: any; // 添加索引签名
}

class CustomConfigService {
    private _config: PropertiesConfig;
    private _listeners: Array<(config: PropertiesConfig) => void> = [];
    private _logger: CustomLoggerService;

    static $inject = ['customLogger'];

    constructor(customLogger: CustomLoggerService) {
        this._logger = customLogger;
        this._config = { ...DEFAULT_CONFIG_JSON } as PropertiesConfig;

        // 异步加载远程配置
        this._loadRemoteConfig();

        this._logger.info('Configuration service initialized with default config', {
            version: this._config.version,
            description: this._config.description
        });
    }

    // 私有方法：异步加载远程配置
    private async _loadRemoteConfig(): Promise<void> {
        try {
            // 从环境变量获取远程配置URL，优先级：VITE_BPMN_CONFIG_URL > BPMN_CONFIG_URL > 默认URL
            const remoteConfigUrl = process.env.VITE_BPMN_CONFIG_URL ||
                process.env.BPMN_CONFIG_URL ||
                '/api/bpmn/config';

            this._logger.debug('Loading remote config from:', remoteConfigUrl);

            const remoteConfig = await loadRemoteConfig(remoteConfigUrl);

            // 验证远程配置
            if (remoteConfig && remoteConfig.version) {
                this._config = { ...remoteConfig } as PropertiesConfig;

                this._logger.info('Remote configuration loaded successfully', {
                    version: this._config.version,
                    description: this._config.description
                });

                // 通知监听器配置已更新
                this._listeners.forEach(listener => {
                    try {
                        listener(this._config);
                    } catch (error) {
                        this._logger.error('Error notifying listener of remote config', error);
                    }
                });
            } else {
                this._logger.warn('Invalid remote configuration, keeping default');
            }
        } catch (error) {
            this._logger.error('Failed to load remote configuration', error);
        }
    }

    // 获取完整配置
    getConfig(): PropertiesConfig {
        return { ...this._config };
    }

    // 获取配置的特定部分
    getTheme(): any {
        return { ...this._config.theme };
    }

    getFields(): any {
        return { ...this._config.fields };
    }

    getBehaviors(): any {
        return { ...this._config.behaviors };
    }

    getElementTypes(): any {
        return { ...this._config.elementTypes };
    }

    getValidation(): any {
        return { ...this._config.validation };
    }

    getI18n(): any {
        return { ...this._config.i18n };
    }

    getPerformance(): any {
        return { ...this._config.performance };
    }

    getExtensions(): any {
        return { ...this._config.extensions };
    }

    getDebug(): any {
        return { ...this._config.debug };
    }

    // 更新配置
    updateConfig(updates: Partial<PropertiesConfig>): void {
        const oldConfig = { ...this._config };
        this._config = { ...this._config, ...updates };

        this._logger.info('Configuration updated', {
            oldVersion: oldConfig.version,
            newVersion: this._config.version,
            changes: Object.keys(updates)
        });

        // 通知所有监听器
        this._listeners.forEach(listener => {
            try {
                listener(this._config);
            } catch (error) {
                this._logger.error('Error notifying listener', error);
            }
        });
    }

    // 更新配置的特定部分
    updateTheme(theme: any): void {
        this.updateConfig({ theme: { ...this._config.theme, ...theme } });
    }

    updateFields(fields: any): void {
        this.updateConfig({ fields: { ...this._config.fields, ...fields } });
    }

    updateBehaviors(behaviors: any): void {
        this.updateConfig({ behaviors: { ...this._config.behaviors, ...behaviors } });
    }

    updateElementTypes(elementTypes: any): void {
        this.updateConfig({ elementTypes: { ...this._config.elementTypes, ...elementTypes } });
    }

    updateValidation(validation: any): void {
        this.updateConfig({ validation: { ...this._config.validation, ...validation } });
    }

    updateI18n(i18n: any): void {
        this.updateConfig({ i18n: { ...this._config.i18n, ...i18n } });
    }

    updatePerformance(performance: any): void {
        this.updateConfig({ performance: { ...this._config.performance, ...performance } });
    }

    updateExtensions(extensions: any): void {
        this.updateConfig({ extensions: { ...this._config.extensions, ...extensions } });
    }

    updateDebug(debug: any): void {
        this.updateConfig({ debug: { ...this._config.debug, ...debug } });
    }

    // 重置为默认配置
    resetToDefault(): void {
        this._config = { ...DEFAULT_CONFIG_JSON } as PropertiesConfig;
        this._logger.info('Configuration reset to default');

        // 通知所有监听器
        this._listeners.forEach(listener => listener(this._config));
    }

    // 监听配置变化
    onConfigChange(listener: (config: PropertiesConfig) => void): () => void {
        this._listeners.push(listener);

        // 返回取消订阅函数
        return () => {
            const index = this._listeners.indexOf(listener);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        };
    }

    // 获取配置值（支持点分隔路径）
    get(path: string, defaultValue?: any): any {
        const keys = path.split('.');
        let value = this._config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    // 设置配置值（支持点分隔路径）
    set(path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        let target = this._config;

        // 导航到倒数第二个键
        for (const key of keys) {
            if (!(key in target) || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }

        target[lastKey] = value;

        // 通知监听器
        this._listeners.forEach(listener => listener(this._config));
    }

    // 验证配置
    validateConfig(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // 基本验证
        if (!this._config.version) {
            errors.push('Version is required');
        }

        if (!this._config.theme) {
            errors.push('Theme configuration is required');
        }

        if (!this._config.fields) {
            errors.push('Fields configuration is required');
        }

        // 验证字段配置
        if (this._config.fields) {
            Object.entries(this._config.fields).forEach(([fieldKey, fieldConfig]: [string, any]) => {
                if (fieldConfig.enabled && !fieldConfig.label) {
                    errors.push(`Field '${fieldKey}' is enabled but missing label`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // 导出配置为JSON
    exportConfig(): string {
        return JSON.stringify(this._config, null, 2);
    }

    // 从JSON导入配置
    importConfig(jsonString: string): { success: boolean; error?: string } {
        try {
            const importedConfig = JSON.parse(jsonString);

            // 基本验证
            if (!importedConfig.version) {
                return { success: false, error: 'Invalid configuration: missing version' };
            }

            this._config = importedConfig as PropertiesConfig;

            // 通知监听器
            this._listeners.forEach(listener => listener(this._config));

            return { success: true };
        } catch (error) {
            return { success: false, error: `Failed to parse configuration: ${error}` };
        }
    }
}

// 导出类
export { CustomConfigService };

// BPMN-JS 模块定义
export default {
    __depends__: [CustomLoggerModule],
    __init__: ['customConfig'],
    customConfig: ['type', CustomConfigService]
};
