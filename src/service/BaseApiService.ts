import { RequestConfig, ApiError, RequestInterceptor, ResponseInterceptor } from './types';

// 类型断言辅助函数
const electronAPI = (window as any).electronAPI;

/**
 * 基础API服务类
 * 提供通用的HTTP请求方法和错误处理
 */
export abstract class BaseApiService {
    protected baseURL: string;
    protected defaultHeaders: Record<string, string>;
    protected requestInterceptors: RequestInterceptor[] = [];
    protected responseInterceptors: ResponseInterceptor[] = [];

    constructor(baseURL: string = '/myapp-api') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    /**
     * 添加请求拦截器
     */
    public addRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * 添加响应拦截器
     */
    public addResponseInterceptor(interceptor: ResponseInterceptor): void {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * 通用请求方法
     */
    protected async request<T = any>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<T> {
        // 合并默认配置
        let finalConfig: RequestConfig = {
            headers: {
                ...this.defaultHeaders,
                ...config.headers,
            },
            ...config,
        };

        // 执行请求拦截器
        for (const interceptor of this.requestInterceptors) {
            finalConfig = await interceptor(finalConfig);
        }

        try {
            // 首先尝试通过IPC调用主进程代理
            try {
                const proxyResult = await electronAPI.proxyRequest({
                    service: 'myapp-api', // 使用myapp-api服务
                    config: {
                        method: finalConfig.method || 'GET',
                        url: endpoint,
                        headers: finalConfig.headers,
                        body: typeof finalConfig.body === 'string' ? finalConfig.body : JSON.stringify(finalConfig.body),
                        timeout: finalConfig.timeout
                    }
                });

                if (!proxyResult.success) {
                    throw new ApiError(
                        proxyResult.error || 'Proxy request failed',
                        0,
                        proxyResult.details?.statusCode || 0
                    );
                }

                const data = proxyResult.data;

                // 执行响应拦截器（模拟response对象）
                let processedData = data;
                for (const interceptor of this.responseInterceptors) {
                    // 为响应拦截器创建一个模拟的response对象
                    const mockResponse = {
                        ok: true,
                        status: 200,
                        statusText: 'OK',
                        headers: new Headers(),
                        url: '',
                        redirected: false,
                        type: 'basic' as ResponseType,
                        json: () => Promise.resolve(data),
                        text: () => Promise.resolve(JSON.stringify(data)),
                        blob: () => Promise.reject(new Error('Not implemented')),
                        arrayBuffer: () => Promise.reject(new Error('Not implemented')),
                        formData: () => Promise.reject(new Error('Not implemented')),
                        clone: () => mockResponse as any
                    } as Response;
                    processedData = await interceptor(mockResponse, processedData);
                }

                return processedData;
            } catch (proxyError) {
                console.warn('IPC proxy failed, falling back to fetch:', proxyError);

                // IPC代理失败，回退到直接fetch（用于开发环境）
                const fullUrl = `${this.baseURL}${endpoint}`;

                // 设置超时
                const controller = new AbortController();
                const timeoutId = finalConfig.timeout
                    ? setTimeout(() => controller.abort(), finalConfig.timeout)
                    : null;

                const fetchConfig: RequestInit = {
                    method: finalConfig.method || 'GET',
                    headers: finalConfig.headers,
                    body: finalConfig.body,
                    signal: controller.signal,
                };

                const response = await fetch(fullUrl, fetchConfig);

                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                if (!response.ok) {
                    throw new ApiError(
                        `HTTP error! status: ${response.status}`,
                        0,
                        response.status
                    );
                }

                const data = await response.json();

                // 执行响应拦截器
                let processedData = data;
                for (const interceptor of this.responseInterceptors) {
                    processedData = await interceptor(response, processedData);
                }

                return processedData;
            }
        } catch (error) {
            console.error('API request failed:', error);

            if (error instanceof ApiError) {
                throw error;
            }

            // 处理网络错误或其他错误
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new ApiError('Request timeout', -1, 408);
                }
                throw new ApiError(error.message, -1, 0);
            }

            throw new ApiError('Unknown error occurred', -1, 0);
        }
    }

    /**
     * GET 请求
     */
    protected async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
        console.log('[BaseApiService]get endpoint', endpoint)
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    /**
     * POST 请求
     */
    protected async post<T = any>(
        endpoint: string,
        data?: any,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT 请求
     */
    protected async put<T = any>(
        endpoint: string,
        data?: any,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE 请求
     */
    protected async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }

    /**
     * PATCH 请求
     */
    protected async patch<T = any>(
        endpoint: string,
        data?: any,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
}
