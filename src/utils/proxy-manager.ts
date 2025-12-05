import got, { Options, Response as GotResponse } from 'got';

/**
 * 代理服务类型枚举
 */
export enum ProxyServiceType {
  MYAPP_API = 'myapp-api',
  API = 'api',
  BPMN = 'bpmn',
  AUTH = 'auth',
  FILE = 'file'
}

/**
 * 代理请求配置接口
 */
export interface ProxyRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: string | object;
  searchParams?: Record<string, string>;
  timeout?: number;
}

/**
 * 代理配置项接口
 */
export interface ProxyConfigItem {
  service: ProxyServiceType;
  target: string;
  pathRewrite?: { [key: string]: string };
  timeout?: number;
  sslVerify?: boolean;
  headers?: Record<string, string>;
}

/**
 * 主进程代理管理器 - 实现Nginx风格的反向代理
 */
export class ProxyManager {
  private proxyConfigs: Map<ProxyServiceType, ProxyConfigItem> = new Map();
  private defaultHeaders: Record<string, string>;
  private initialized: boolean = false;

  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Electron/' + process.versions.electron,
      'Accept': 'application/json'
    };

    this.initializeProxyConfigs();
  }

  /**
   * 初始化代理配置
   */
  private initializeProxyConfigs(): void {
    // 从环境变量初始化代理配置
    this.proxyConfigs.set(ProxyServiceType.API, {
      service: ProxyServiceType.API,
      target: process.env.MAIN_API_TARGET || 'http://localhost:8080',
      timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
      sslVerify: process.env.VERIFY_SSL !== 'false'
    });

    this.proxyConfigs.set(ProxyServiceType.BPMN, {
      service: ProxyServiceType.BPMN,
      target: process.env.MAIN_BPMN_TARGET || 'http://localhost:8080/bpmn/v1',
      timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
      sslVerify: process.env.VERIFY_SSL !== 'false'
    });

    this.proxyConfigs.set(ProxyServiceType.AUTH, {
      service: ProxyServiceType.AUTH,
      target: process.env.MAIN_AUTH_TARGET || 'http://localhost:8081/auth',
      timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
      sslVerify: process.env.VERIFY_SSL !== 'false'
    });

    this.proxyConfigs.set(ProxyServiceType.FILE, {
      service: ProxyServiceType.FILE,
      target: process.env.MAIN_FILE_TARGET || 'http://localhost:8082/files',
      timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
      sslVerify: process.env.VERIFY_SSL !== 'false'
    });


    this.proxyConfigs.set(ProxyServiceType.MYAPP_API, {
      service: ProxyServiceType.MYAPP_API,
      target: 'http://localhost:8000/myapp-api',
      timeout: parseInt(process.env.PROXY_TIMEOUT || '30000'),
      sslVerify: process.env.VERIFY_SSL !== 'false'
    });

    this.initialized = true;
    console.log('ProxyManager initialized with configs:', [...this.proxyConfigs.keys()]);
  }

  /**
   * 执行代理请求
   */
  async proxyRequest(
    service: ProxyServiceType,
    config: ProxyRequestConfig,
    customPathRewrite?: Record<string, string>
  ): Promise<any> {
    if (!this.initialized) {
      throw new Error('ProxyManager not initialized');
    }

    const proxyConfig = this.proxyConfigs.get(service);
    if (!proxyConfig) {
      throw new Error(`No proxy configuration found for service: ${service}`);
    }

    try {
      // 构建完整URL
      const baseUrl = proxyConfig.target.endsWith('/')
        ? proxyConfig.target.slice(0, -1)
        : proxyConfig.target;

      const originalUrl = config.url.startsWith('/')
        ? config.url
        : '/' + config.url;

      // 应用路径重写
      let finalUrl = originalUrl;
      const pathRewrite = proxyConfig.pathRewrite || customPathRewrite;
      if (pathRewrite) {
        Object.entries(pathRewrite).forEach(([pattern, replacement]) => {
          const regex = new RegExp(pattern.replace(/\^/, ''), 'g');
          finalUrl = finalUrl.replace(regex, replacement as string);
        });
      }

      const fullUrl = baseUrl + finalUrl;
      console.log(`[Proxy-${service}] ${config.method || 'GET'} ${fullUrl}`);

      // 准备请求body
      let jsonBody: any = undefined;
      if (config.body && typeof config.body === 'object') {
        jsonBody = config.body;
      } else if (config.body && typeof config.body === 'string') {
        try {
          jsonBody = JSON.parse(config.body);
        } catch {
          // 如果不是JSON，保持为字符串
        }
      }

      // 构建got选项
      const gotOptions: Options = {
        method: config.method || 'GET',
        timeout: { request: proxyConfig.timeout },
        headers: {
          ...this.defaultHeaders,
          ...proxyConfig.headers,
          ...config.headers
        },
        searchParams: config.searchParams,
        https: proxyConfig.sslVerify ? undefined : { rejectUnauthorized: false }
      };

      // 添加请求体
      if (jsonBody && config.method !== 'GET') {
        gotOptions.json = jsonBody;
      }

      // 发送请求
      const response = await got(fullUrl, gotOptions) as GotResponse<string>;

      console.log(`[Proxy-${service}] Response: ${response.statusCode} - ${response.statusMessage || ''}`);

      // 返回响应
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        return JSON.parse(response.body);
      } else {
        return response.body;
      }

    } catch (error: any) {
      console.error(`[Proxy-${service}] Request failed:`, error.message);

      // 重新抛出错误，让调用方处理
      throw {
        service,
        url: proxyConfig.target,
        originalError: error,
        message: `Proxy request failed for ${service}: ${error.message}`,
        statusCode: error.response?.statusCode,
        body: error.response?.body
      };
    }
  }

  /**
   * 获取代理配置信息
   */
  getProxyConfig(service: ProxyServiceType): ProxyConfigItem | undefined {
    return this.proxyConfigs.get(service);
  }

  /**
   * 更新代理配置
   */
  updateProxyConfig(service: ProxyServiceType, updates: Partial<ProxyConfigItem>): void {
    const existingConfig = this.proxyConfigs.get(service);
    if (existingConfig) {
      this.proxyConfigs.set(service, { ...existingConfig, ...updates });
      console.log(`Proxy config updated for ${service}:`, updates);
    }
  }

  /**
   * 获取所有代理配置
   */
  getAllProxyConfigs(): Record<string, ProxyConfigItem> {
    const configs: Record<string, ProxyConfigItem> = {};
    this.proxyConfigs.forEach((config, service) => {
      configs[service] = config;
    });
    return configs;
  }

  /**
   * 健康检查 - 检查所有代理目标是否可达
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [service, config] of this.proxyConfigs.entries()) {
      try {
        await got(config.target + '/health', {
          timeout: { request: 5000 },
          https: config.sslVerify ? undefined : { rejectUnauthorized: false }
        });
        results[service] = true;
      } catch (error) {
        results[service] = false;
      }
    }

    return results;
  }
}

// 单例模式 - 主进程中只有一个代理管理器实例
let proxyManagerInstance: ProxyManager | null = null;

export function getProxyManager(): ProxyManager {
  if (!proxyManagerInstance) {
    proxyManagerInstance = new ProxyManager();
  }
  return proxyManagerInstance;
}

// 便捷使用函数
export async function proxyApiRequest(service: ProxyServiceType, config: ProxyRequestConfig, pathRewrite?: any) {
  const proxyManager = getProxyManager();
  return proxyManager.proxyRequest(service, config, pathRewrite);
}

export default ProxyManager;
