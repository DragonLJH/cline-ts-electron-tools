// 自定义日志服务
class CustomLoggerService {
    private _prefix: string;
    private _useStyledOutput: boolean;

    // 控制台样式配置
    private static readonly STYLES = {
        prefix: 'color: #6b7280; font-weight: bold;',
        timestamp: 'color: #9ca3af; font-size: 0.8em;',
        info: 'color: #3b82f6; font-weight: bold; background: #eff6ff; padding: 2px 4px; border-radius: 2px;',
        warn: 'color: #f59e0b; font-weight: bold; background: #fffbeb; padding: 2px 4px; border-radius: 2px;',
        error: 'color: #ef4444; font-weight: bold; background: #fef2f2; padding: 2px 4px; border-radius: 2px;',
        debug: 'color: #8b5cf6; font-weight: bold; background: #f3e8ff; padding: 2px 4px; border-radius: 2px;',
        message: 'color: #1f2937;',
        data: 'color: #374151; background: #f9fafb; padding: 2px 4px; border-radius: 2px; font-family: monospace;'
    };

    constructor() {
        this._prefix = '[CustomLogger]';
        this._useStyledOutput = true; // 默认启用样式化输出

        // 初始化时使用样式化输出
        console.log(`%c${this._prefix}%c CustomLoggerService initialized %c${new Date().toLocaleTimeString()}`,
            CustomLoggerService.STYLES.prefix,
            CustomLoggerService.STYLES.info,
            CustomLoggerService.STYLES.timestamp);
    }

    // 获取当前时间戳
    private getTimestamp(): string {
        return new Date().toLocaleTimeString();
    }

    // 格式化日志消息
    private formatMessage(level: string, message: string, data?: any): string[] {
        const timestamp = this.getTimestamp();
        if (this._useStyledOutput) {
            const levelStyle = CustomLoggerService.STYLES[level as keyof typeof CustomLoggerService.STYLES];
            if (data !== undefined && data !== null) {
                return [
                    `%c${this._prefix}%c ${level.toUpperCase()} %c${timestamp}%c ${message}`,
                    CustomLoggerService.STYLES.prefix,
                    levelStyle,
                    CustomLoggerService.STYLES.timestamp,
                    CustomLoggerService.STYLES.message,
                    data
                ];
            } else {
                return [
                    `%c${this._prefix}%c ${level.toUpperCase()} %c${timestamp}%c ${message}`,
                    CustomLoggerService.STYLES.prefix,
                    levelStyle,
                    CustomLoggerService.STYLES.timestamp,
                    CustomLoggerService.STYLES.message
                ];
            }
        } else {
            const baseMessage = `${this._prefix} ${level.toUpperCase()}: ${message}`;
            return data !== undefined && data !== null ? [baseMessage, data] : [baseMessage];
        }
    }

    // 记录信息日志
    info(message: string, data?: any): void {
        const formatted = this.formatMessage('info', message, data);
        if (this._useStyledOutput) {
            console.log(...formatted);
        } else {
            console.log(...formatted);
        }
    }

    // 记录警告日志
    warn(message: string, data?: any): void {
        const formatted = this.formatMessage('warn', message, data);
        if (this._useStyledOutput) {
            console.warn(...formatted);
        } else {
            console.warn(...formatted);
        }
    }

    // 记录错误日志
    error(message: string, data?: any): void {
        const formatted = this.formatMessage('error', message, data);
        if (this._useStyledOutput) {
            console.error(...formatted);
        } else {
            console.error(...formatted);
        }
    }

    // 记录调试信息
    debug(message: string, data?: any): void {
        const formatted = this.formatMessage('debug', message, data);
        if (this._useStyledOutput) {
            console.debug(...formatted);
        } else {
            console.debug(...formatted);
        }
    }

    // 设置日志前缀
    setPrefix(prefix: string): void {
        this._prefix = prefix;
    }

    // 启用/禁用样式化输出
    setStyledOutput(enabled: boolean): void {
        this._useStyledOutput = enabled;
    }

    // 获取样式配置（用于自定义）
    static getStyles(): typeof CustomLoggerService.STYLES {
        return { ...CustomLoggerService.STYLES };
    }

    // 创建分组日志
    group(label: string): void {
        console.group(`${this._prefix} ${label}`);
    }

    // 结束分组
    groupEnd(): void {
        console.groupEnd();
    }

    // 创建可折叠分组
    groupCollapsed(label: string): void {
        console.groupCollapsed(`${this._prefix} ${label}`);
    }

    // 记录表格数据
    table(data: any): void {
        console.table(data);
    }

    // 记录堆栈跟踪
    trace(message?: string): void {
        if (message) {
            console.trace(`${this._prefix} TRACE: ${message}`);
        } else {
            console.trace(`${this._prefix} TRACE`);
        }
    }
}

// 导出类
export { CustomLoggerService };

// BPMN-JS 模块定义
export default {
    __depends__: [],
    __init__: ['customLogger'],
    customLogger: ['type', CustomLoggerService]
};
