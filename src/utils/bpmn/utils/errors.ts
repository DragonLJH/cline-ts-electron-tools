/**
 * BPMN 工具模块错误处理
 */

import { ERROR_CODES } from './constants';

/**
 * BPMN 相关错误的基类
 */
export class BpmnError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'BpmnError';
    this.code = code;
    this.details = details;

    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BpmnError);
    }
  }

  /**
   * 创建无效XML错误
   */
  static invalidXml(details?: any): BpmnError {
    return new BpmnError(
      'Invalid BPMN XML: must be a non-empty string',
      ERROR_CODES.INVALID_XML,
      details
    );
  }

  /**
   * 创建容器未找到错误
   */
  static containerNotFound(container: string | HTMLElement): BpmnError {
    return new BpmnError(
      `Container element not found: ${container}`,
      ERROR_CODES.CONTAINER_NOT_FOUND,
      { container }
    );
  }

  /**
   * 创建无效容器错误
   */
  static invalidContainer(container: any): BpmnError {
    return new BpmnError(
      'Container must be a valid HTMLElement',
      ERROR_CODES.INVALID_CONTAINER,
      { container }
    );
  }

  /**
   * 创建导入失败错误
   */
  static importFailed(details?: any): BpmnError {
    return new BpmnError(
      'BPMN XML import failed',
      ERROR_CODES.IMPORT_FAILED,
      details
    );
  }

  /**
   * 创建导出失败错误
   */
  static exportFailed(details?: any): BpmnError {
    return new BpmnError(
      'BPMN XML export failed',
      ERROR_CODES.EXPORT_FAILED,
      details
    );
  }
}

/**
 * 验证容器元素
 */
export function validateContainer(container: HTMLElement | string): HTMLElement {
  if (!container) {
    throw BpmnError.containerNotFound(container);
  }

  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!element) {
    throw BpmnError.containerNotFound(container);
  }

  if (!(element instanceof HTMLElement)) {
    throw BpmnError.invalidContainer(container);
  }

  return element;
}

/**
 * 验证XML字符串
 */
export function validateXml(xml: string): void {
  if (!xml || typeof xml !== 'string') {
    throw BpmnError.invalidXml({ xml });
  }
}

/**
 * 包装异步操作的错误处理
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorFactory: (error: any) => BpmnError
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof BpmnError) {
      throw error;
    }
    throw errorFactory(error);
  }
}
