/**
 * 自定义BPMN XML解析器
 * 不依赖bpmn-js，仅实现XML字符串到解析器的转换
 */

import { validateXml, BpmnError } from './errors';
import { BPMN_NAMESPACES, BPMN_ELEMENT_TYPES } from './constants';

/**
 * BPMN元素基础接口
 */
export interface BpmnBaseElement {
  id: string;
  type: string;
  name?: string;
  [key: string]: any;
}

/**
 * BPMN流程定义
 */
export interface BpmnProcess extends BpmnBaseElement {
  type: 'bpmn:Process';
  isExecutable: boolean;
  elements: BpmnBaseElement[];
}

/**
 * BPMN开始事件
 */
export interface BpmnStartEvent extends BpmnBaseElement {
  type: 'bpmn:StartEvent';
  outgoing: string[];
}

/**
 * BPMN结束事件
 */
export interface BpmnEndEvent extends BpmnBaseElement {
  type: 'bpmn:EndEvent';
  incoming: string[];
}

/**
 * BPMN用户任务
 */
export interface BpmnUserTask extends BpmnBaseElement {
  type: 'bpmn:UserTask';
  incoming: string[];
  outgoing: string[];
}

/**
 * BPMN排他网关
 */
export interface BpmnExclusiveGateway extends BpmnBaseElement {
  type: 'bpmn:ExclusiveGateway';
  incoming: string[];
  outgoing: string[];
}

/**
 * BPMN并行网关
 */
export interface BpmnParallelGateway extends BpmnBaseElement {
  type: 'bpmn:ParallelGateway';
  incoming: string[];
  outgoing: string[];
}

/**
 * BPMN顺序流
 */
export interface BpmnSequenceFlow extends BpmnBaseElement {
  type: 'bpmn:SequenceFlow';
  sourceRef: string;
  targetRef: string;
}

/**
 * BPMN解析结果
 */
export interface BpmnParseResult {
  definitions: {
    id: string;
    targetNamespace: string;
    processes: BpmnProcess[];
    elements: BpmnBaseElement[];
  };
  warnings: string[];
}

/**
 * 自定义BPMN XML解析器类
 */
export class CustomBpmnXmlParser {
  private parser: DOMParser;
  private serializer: XMLSerializer;

  constructor() {
    this.parser = new DOMParser();
    this.serializer = new XMLSerializer();
  }

  /**
   * 解析BPMN XML字符串
   */
  parse(xml: string): BpmnParseResult {
    // 验证XML字符串
    validateXml(xml);

    try {
      // 解析XML文档
      const doc = this.parser.parseFromString(xml, 'text/xml');

      // 检查解析错误
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        throw BpmnError.importFailed({
          message: 'XML parsing failed',
          details: this.serializer.serializeToString(parseError)
        });
      }

      // 验证BPMN根元素
      const definitions = doc.documentElement;
      if (definitions.tagName !== 'bpmn:definitions') {
        throw BpmnError.importFailed({
          message: 'Invalid BPMN XML: root element must be bpmn:definitions'
        });
      }

      // 解析定义信息
      const definitionsId = definitions.getAttribute('id') || 'Definitions_1';
      const targetNamespace = definitions.getAttribute('targetNamespace') || 'http://bpmn.io/schema/bpmn';

      // 解析所有流程
      const processes = this.parseProcesses(definitions);

      // 解析所有元素
      const elements = this.parseElements(definitions);

      return {
        definitions: {
          id: definitionsId,
          targetNamespace,
          processes,
          elements
        },
        warnings: []
      };

    } catch (error) {
      if (error instanceof BpmnError) {
        throw error;
      }
      throw BpmnError.importFailed({
        message: 'Unexpected error during XML parsing',
        originalError: error
      });
    }
  }

  /**
   * 解析流程定义
   */
  private parseProcesses(definitions: Element): BpmnProcess[] {
    const processes: BpmnProcess[] = [];
    const processElements = definitions.querySelectorAll('bpmn\\:process, process');

    processElements.forEach(processEl => {
      const process: BpmnProcess = {
        id: processEl.getAttribute('id') || '',
        type: 'bpmn:Process',
        name: processEl.getAttribute('name') || undefined,
        isExecutable: processEl.getAttribute('isExecutable') === 'true',
        elements: []
      };

      // 解析流程内的元素
      process.elements = this.parseProcessElements(processEl);
      processes.push(process);
    });

    return processes;
  }

  /**
   * 解析流程内的元素
   */
  private parseProcessElements(processEl: Element): BpmnBaseElement[] {
    const elements: BpmnBaseElement[] = [];

    // 解析开始事件
    const startEvents = processEl.querySelectorAll('bpmn\\:startEvent, startEvent');
    startEvents.forEach(el => {
      elements.push(this.parseStartEvent(el));
    });

    // 解析结束事件
    const endEvents = processEl.querySelectorAll('bpmn\\:endEvent, endEvent');
    endEvents.forEach(el => {
      elements.push(this.parseEndEvent(el));
    });

    // 解析用户任务
    const userTasks = processEl.querySelectorAll('bpmn\\:userTask, userTask');
    userTasks.forEach(el => {
      elements.push(this.parseUserTask(el));
    });

    // 解析排他网关
    const exclusiveGateways = processEl.querySelectorAll('bpmn\\:exclusiveGateway, exclusiveGateway');
    exclusiveGateways.forEach(el => {
      elements.push(this.parseExclusiveGateway(el));
    });

    // 解析并行网关
    const parallelGateways = processEl.querySelectorAll('bpmn\\:parallelGateway, parallelGateway');
    parallelGateways.forEach(el => {
      elements.push(this.parseParallelGateway(el));
    });

    // 解析顺序流
    const sequenceFlows = processEl.querySelectorAll('bpmn\\:sequenceFlow, sequenceFlow');
    sequenceFlows.forEach(el => {
      elements.push(this.parseSequenceFlow(el));
    });

    return elements;
  }

  /**
   * 解析开始事件
   */
  private parseStartEvent(el: Element): BpmnStartEvent {
    const outgoing = Array.from(el.querySelectorAll('bpmn\\:outgoing, outgoing'))
      .map(outEl => outEl.textContent || '')
      .filter(text => text.length > 0);

    return {
      id: el.getAttribute('id') || '',
      type: 'bpmn:StartEvent',
      name: el.getAttribute('name') || undefined,
      outgoing
    };
  }

  /**
   * 解析结束事件
   */
  private parseEndEvent(el: Element): BpmnEndEvent {
    const incoming = Array.from(el.querySelectorAll('bpmn\\:incoming, incoming'))
      .map(inEl => inEl.textContent || '')
      .filter(text => text.length > 0);

    return {
      id: el.getAttribute('id') || '',
      type: 'bpmn:EndEvent',
      name: el.getAttribute('name') || undefined,
      incoming
    };
  }

  /**
   * 解析用户任务
   */
  private parseUserTask(el: Element): BpmnUserTask {
    const incoming = Array.from(el.querySelectorAll('bpmn\\:incoming, incoming'))
      .map(inEl => inEl.textContent || '')
      .filter(text => text.length > 0);

    const outgoing = Array.from(el.querySelectorAll('bpmn\\:outgoing, outgoing'))
      .map(outEl => outEl.textContent || '')
      .filter(text => text.length > 0);

    return {
      id: el.getAttribute('id') || '',
      type: 'bpmn:UserTask',
      name: el.getAttribute('name') || undefined,
      incoming,
      outgoing
    };
  }

  /**
   * 解析排他网关
   */
  private parseExclusiveGateway(el: Element): BpmnExclusiveGateway {
    const incoming = Array.from(el.querySelectorAll('bpmn\\:incoming, incoming'))
      .map(inEl => inEl.textContent || '')
      .filter(text => text.length > 0);

    const outgoing = Array.from(el.querySelectorAll('bpmn\\:outgoing, outgoing'))
      .map(outEl => outEl.textContent || '')
      .filter(text => text.length > 0);

    return {
      id: el.getAttribute('id') || '',
      type: 'bpmn:ExclusiveGateway',
      name: el.getAttribute('name') || undefined,
      incoming,
      outgoing
    };
  }

  /**
   * 解析并行网关
   */
  private parseParallelGateway(el: Element): BpmnParallelGateway {
    const incoming = Array.from(el.querySelectorAll('bpmn\\:incoming, incoming'))
      .map(inEl => inEl.textContent || '')
      .filter(text => text.length > 0);

    const outgoing = Array.from(el.querySelectorAll('bpmn\\:outgoing, outgoing'))
      .map(outEl => outEl.textContent || '')
      .filter(text => text.length > 0);

    return {
      id: el.getAttribute('id') || '',
      type: 'bpmn:ParallelGateway',
      name: el.getAttribute('name') || undefined,
      incoming,
      outgoing
    };
  }

  /**
   * 解析顺序流
   */
  private parseSequenceFlow(el: Element): BpmnSequenceFlow {
    return {
      id: el.getAttribute('id') || '',
      type: 'bpmn:SequenceFlow',
      name: el.getAttribute('name') || undefined,
      sourceRef: el.getAttribute('sourceRef') || '',
      targetRef: el.getAttribute('targetRef') || ''
    };
  }

  /**
   * 解析所有元素（包括非流程元素）
   */
  private parseElements(definitions: Element): BpmnBaseElement[] {
    const elements: BpmnBaseElement[] = [];

    // 这里可以扩展解析其他类型的元素
    // 目前主要关注流程内的元素

    return elements;
  }
}

/**
 * 导入XML的便捷函数
 * @param xml BPMN XML字符串
 * @returns 解析结果
 */
export function importXML(xml: string): BpmnParseResult {
  const parser = new CustomBpmnXmlParser();
  return parser.parse(xml);
}

/**
 * 默认导出解析器类
 */
export default CustomBpmnXmlParser;
