// 服务相关类型定义

// HTTP 请求配置
export interface RequestConfig extends RequestInit {
  timeout?: number;
}

// API 错误类
export class ApiError extends Error {
  public code: number;
  public status: number;

  constructor(message: string, code: number = 0, status: number = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// 请求拦截器类型
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

// 响应拦截器类型
export type ResponseInterceptor<T = any> = (response: Response, data: T) => T | Promise<T>;
