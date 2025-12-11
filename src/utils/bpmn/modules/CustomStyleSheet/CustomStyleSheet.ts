/**
 * Custom StyleSheet Module - BPMN自定义样式表模块
 * 实现bpmn-js的样式表扩展，支持基于Tailwind的动态样式
 */

import { BpmnElementStyles, getElementStyle, getThemedElementStyle } from '../../styles';
import { CustomLoggerService } from '../CustomLoggerService/CustomLoggerService';

export interface StyleSheetOptions {
  theme?: string;
  customStyles?: Partial<BpmnElementStyles>;
  priority?: number;
}

/**
 * BPMN自定义样式表类
 * 实现diagram-js的样式表接口
 */
export default class CustomStyleSheet {
  private _logger: CustomLoggerService;
  private _options: StyleSheetOptions;
  private _styles: Map<string, any> = new Map();

  static $inject = ['eventBus', 'styles'];

  constructor(eventBus: any, styles: any, options: StyleSheetOptions = {}) {
    this._logger = new CustomLoggerService();
    this._options = {
      theme: 'light',
      priority: 1000,
      ...options
    };

    this._logger.debug('CustomStyleSheet initialized', { options });

    // 监听样式变更事件
    eventBus.on('styleSheet.changed', (context: any) => {
      this._logger.debug('StyleSheet changed event received', context);
      this._updateStyles();
    });

    // 初始化样式
    this._initializeStyles();
  }

  /**
   * 初始化样式规则
   * @private
   */
  private _initializeStyles(): void {
    // BPMN 2.0 标准元素样式规则
    const elementRules = [
      // 事件样式
      { type: 'bpmn:StartEvent', rules: this._getStartEventRules() },
      { type: 'bpmn:EndEvent', rules: this._getEndEventRules() },
      { type: 'bpmn:IntermediateThrowEvent', rules: this._getIntermediateEventRules() },
      { type: 'bpmn:IntermediateCatchEvent', rules: this._getIntermediateEventRules() },

      // 任务样式
      { type: 'bpmn:UserTask', rules: this._getUserTaskRules() },
      { type: 'bpmn:ServiceTask', rules: this._getServiceTaskRules() },
      { type: 'bpmn:ManualTask', rules: this._getManualTaskRules() },
      { type: 'bpmn:BusinessRuleTask', rules: this._getBusinessRuleTaskRules() },
      { type: 'bpmn:ScriptTask', rules: this._getScriptTaskRules() },

      // 网关样式
      { type: 'bpmn:ExclusiveGateway', rules: this._getGatewayRules() },
      { type: 'bpmn:InclusiveGateway', rules: this._getGatewayRules() },
      { type: 'bpmn:ParallelGateway', rules: this._getGatewayRules() },

      // 子流程样式
      { type: 'bpmn:SubProcess', rules: this._getSubProcessRules() },
      { type: 'bpmn:CallActivity', rules: this._getCallActivityRules() },

      // 数据对象样式
      { type: 'bpmn:DataObjectReference', rules: this._getDataObjectRules() },
      { type: 'bpmn:DataStoreReference', rules: this._getDataStoreRules() },

      // 连接线样式
      { type: 'bpmn:SequenceFlow', rules: this._getSequenceFlowRules() },
      { type: 'bpmn:MessageFlow', rules: this._getMessageFlowRules() },
      { type: 'bpmn:Association', rules: this._getAssociationRules() },
    ];

    // 注册样式规则
    elementRules.forEach(({ type, rules }) => {
      this._styles.set(type, rules);
    });

    this._logger.debug('StyleSheet initialized with rules', { ruleCount: elementRules.length });
  }

  /**
   * 更新样式（响应主题变更）
   * @private
   */
  private _updateStyles(): void {
    // 重新计算所有样式规则
    this._initializeStyles();
    this._logger.debug('StyleSheet updated');
  }

  /**
   * 获取元素样式规则
   * @param element 元素对象
   * @returns 样式规则对象
   */
  getStyle(element: any): any {
    if (!element || !element.type) {
      return {};
    }

    const elementType = element.type;
    const baseRules = this._styles.get(elementType) || {};

    // 获取主题相关的样式
    const themedStyle = getThemedElementStyle(elementType, this._options.theme);

    // 合并样式
    return {
      ...baseRules,
      fill: themedStyle.fill,
      stroke: themedStyle.stroke,
      strokeWidth: themedStyle.strokeWidth,
      fillOpacity: themedStyle.fillOpacity,
      strokeOpacity: themedStyle.strokeOpacity,
      strokeDasharray: themedStyle.strokeDasharray,
      // diagram-js特有的样式属性
      rx: themedStyle.rx,
      ry: themedStyle.ry,
    };
  }

  /**
   * 获取开始事件样式规则
   * @private
   */
  private _getStartEventRules(): any {
    return {
      // 开始事件特有的样式规则
      className: 'bpmn-start-event',
    };
  }

  /**
   * 获取结束事件样式规则
   * @private
   */
  private _getEndEventRules(): any {
    return {
      // 结束事件特有的样式规则
      className: 'bpmn-end-event',
    };
  }

  /**
   * 获取中间事件样式规则
   * @private
   */
  private _getIntermediateEventRules(): any {
    return {
      // 中间事件特有的样式规则
      className: 'bpmn-intermediate-event',
    };
  }

  /**
   * 获取用户任务样式规则
   * @private
   */
  private _getUserTaskRules(): any {
    return {
      // 用户任务特有的样式规则
      className: 'bpmn-user-task',
    };
  }

  /**
   * 获取服务任务样式规则
   * @private
   */
  private _getServiceTaskRules(): any {
    return {
      // 服务任务特有的样式规则
      className: 'bpmn-service-task',
    };
  }

  /**
   * 获取手动任务样式规则
   * @private
   */
  private _getManualTaskRules(): any {
    return {
      // 手动任务特有的样式规则
      className: 'bpmn-manual-task',
    };
  }

  /**
   * 获取业务规则任务样式规则
   * @private
   */
  private _getBusinessRuleTaskRules(): any {
    return {
      // 业务规则任务特有的样式规则
      className: 'bpmn-business-rule-task',
    };
  }

  /**
   * 获取脚本任务样式规则
   * @private
   */
  private _getScriptTaskRules(): any {
    return {
      // 脚本任务特有的样式规则
      className: 'bpmn-script-task',
    };
  }

  /**
   * 获取网关样式规则
   * @private
   */
  private _getGatewayRules(): any {
    return {
      // 网关特有的样式规则
      className: 'bpmn-gateway',
    };
  }

  /**
   * 获取子流程样式规则
   * @private
   */
  private _getSubProcessRules(): any {
    return {
      // 子流程特有的样式规则
      className: 'bpmn-subprocess',
    };
  }

  /**
   * 获取调用活动样式规则
   * @private
   */
  private _getCallActivityRules(): any {
    return {
      // 调用活动特有的样式规则
      className: 'bpmn-call-activity',
    };
  }

  /**
   * 获取数据对象样式规则
   * @private
   */
  private _getDataObjectRules(): any {
    return {
      // 数据对象特有的样式规则
      className: 'bpmn-data-object',
    };
  }

  /**
   * 获取数据存储样式规则
   * @private
   */
  private _getDataStoreRules(): any {
    return {
      // 数据存储特有的样式规则
      className: 'bpmn-data-store',
    };
  }

  /**
   * 获取顺序流样式规则
   * @private
   */
  private _getSequenceFlowRules(): any {
    return {
      // 顺序流特有的样式规则
      className: 'bpmn-sequence-flow',
    };
  }

  /**
   * 获取消息流样式规则
   * @private
   */
  private _getMessageFlowRules(): any {
    return {
      // 消息流特有的样式规则
      className: 'bpmn-message-flow',
    };
  }

  /**
   * 获取关联样式规则
   * @private
   */
  private _getAssociationRules(): any {
    return {
      // 关联特有的样式规则
      className: 'bpmn-association',
    };
  }

  /**
   * 更新样式选项
   * @param options 新的样式选项
   */
  updateOptions(options: Partial<StyleSheetOptions>): void {
    this._options = { ...this._options, ...options };
    this._updateStyles();
    this._logger.debug('StyleSheet options updated', { options });
  }

  /**
   * 获取当前样式选项
   */
  getOptions(): StyleSheetOptions {
    return { ...this._options };
  }

  /**
   * 销毁样式表
   */
  destroy(): void {
    this._styles.clear();
    this._logger.debug('StyleSheet destroyed');
  }
}
