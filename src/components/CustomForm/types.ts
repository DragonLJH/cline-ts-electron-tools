import React from 'react';

/**
 * 支持的字段类型枚举
 */
export type FieldType =
  | 'text'      // 文本输入框
  | 'number'    // 数字输入框
  | 'email'     // 邮箱输入框
  | 'password'  // 密码输入框
  | 'textarea'  // 多行文本输入框
  | 'select'    // 下拉选择框
  | 'checkbox'  // 复选框
  | 'radio'     // 单选框
  | 'switch'    // 开关组件
  | 'date'      // 日期选择器
  | 'time'      // 时间选择器
  | 'search'    // 搜索输入框
  | 'file'      // 文件上传

/**
 * 验证规则配置
 * 支持内置验证规则和自定义验证函数
 */
export type ValidationRule =
  | { type: 'required'; message: string }                           // 必填验证
  | { type: 'min'; value: number; message: string }                // 最小值验证
  | { type: 'max'; value: number; message: string }                // 最大值验证
  | { type: 'minLength'; value: number; message: string }          // 最小长度验证
  | { type: 'maxLength'; value: number; message: string }          // 最大长度验证
  | { type: 'pattern'; value: RegExp; message: string }            // 正则表达式验证
  | { type: 'custom'; validator: (value: any) => boolean; message: string } // 自定义验证

/**
 * 选择框选项配置
 */
export type SelectOption = {
  label: string;     // 显示的文本标签
  value: any;        // 选项的值
  disabled?: boolean; // 是否禁用该选项
};

/**
 * 表单字段配置接口
 * 定义单个表单字段的行为和样式
 */
export interface FormField {
  name: string;                                      // 字段唯一标识符
  type: FieldType;                                  // 字段类型
  label?: string;                                   // 字段标签文本
  placeholder?: string;                             // placeholder 提示文本
  required?: boolean;                               // 是否为必填字段
  disabled?: boolean;                               // 是否禁用字段
  readOnly?: boolean;                               // 是否只读
  defaultValue?: any;                               // 默认值
  options?: SelectOption[];                         // 选项配置（用于 select/radio 等）
  validation?: ValidationRule[];                    // 验证规则数组
  className?: string;                               // 自定义 CSS 类名
  style?: React.CSSProperties;                      // 内联样式
  layout?: 'vertical' | 'horizontal' | 'inline';   // 字段布局（垂直/水平/内联）
  size?: 'small' | 'medium' | 'large';             // 字段尺寸
  tooltip?: string;                                 // 工具提示
  description?: string;                             // 字段描述信息
  dependencies?: string[];                          // 依赖的其他字段
  condition?: (values: Record<string, any>) => boolean; // 显示条件函数
  onChange?: (value: any) => void;                  // 值变更回调
  onBlur?: () => void;                              // 失焦回调
  onFocus?: () => void;                             // 聚焦回调
}

/**
 * 表单整体配置接口
 * 定义表单的行为、样式和事件处理
 */
export interface FormConfig {
  fields: FormField[];                              // 表单字段配置数组
  layout?: 'vertical' | 'horizontal' | 'inline';    // 表单总体布局
  size?: 'small' | 'medium' | 'large';             // 表单总体尺寸
  submitText?: string;                              // 提交按钮文本
  resetText?: string;                               // 重置按钮文本
  submitButtonClassName?: string;                   // 提交按钮自定义类名
  resetButtonClassName?: string;                    // 重置按钮自定义类名
  showReset?: boolean;                              // 是否显示重置按钮
  className?: string;                               // 表单容器自定义类名
  style?: React.CSSProperties;                      // 表单容器内联样式
  onSubmit?: (values: Record<string, any>) => void;  // 表单提交成功回调
  onReset?: () => void;                             // 表单重置回调
  onChange?: (values: Record<string, any>) => void;  // 表单值变化回调
  onErrors?: (errors: Record<string, string>) => void; // 表单错误变化回调
}

/**
 * 表单实例引用接口
 * 提供程序化控制表单的方法
 */
export interface FormInstance {
  submit: () => void;                               // 触发表单提交
  reset: () => void;                               // 重置表单到初始状态
  validate: () => boolean;                         // 验证表单，返回是否通过
  setValue: (name: string, value: any) => void;     // 设置单个字段值
  getValue: (name: string) => any;                 // 获取单个字段值
  getValues: () => Record<string, any>;            // 获取所有字段值
  setValues: (values: Record<string, any>) => void; // 设置多个字段值
  getErrors: () => Record<string, string>;         // 获取所有错误信息
  setError: (name: string, error: string) => void;  // 设置单个字段错误
  clearErrors: () => void;                         // 清空所有错误信息
}
