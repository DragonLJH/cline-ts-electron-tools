import React, { forwardRef, useImperativeHandle } from 'react';
import { FormConfig, FormInstance } from './types';
import { useForm } from './useForm';
import FormField from './FormField';

/**
 * CustomForm 组件 - 高度配置化的表单组件
 *
 * 功能特性:
 * - 支持 11 种不同的字段类型
 * - 灵活的表单验证系统
 * - 多种布局选项 (垂直、水平、内联)
 * - 响应式设计和自定义样式
 * - Ref API 支持程序化控制
 * - 条件字段展示和依赖关系
 *
 * @param props - 表单配置对象
 * @param ref - 表单实例引用，用于程序化控制
 *
 * @example
 * ```tsx
 * const formConfig = {
 *   fields: [{
 *     name: 'username',
 *     type: 'text',
 *     label: '用户名',
 *     required: true,
 *     validation: [
 *       { type: 'required', message: '用户名不能为空' },
 *       { type: 'minLength', value: 3, message: '用户名至少3个字符' }
 *     ]
 *   }],
 *   onSubmit: (values) => console.log(values)
 * };
 *
 * <CustomForm {...formConfig} ref={formRef} />
 * ```
 */
const CustomForm = forwardRef<FormInstance, FormConfig>(({
  fields,
  layout = 'vertical',
  size = 'medium',
  submitText = '提交',
  resetText = '重置',
  showReset = true,
  submitButtonClassName = '',
  resetButtonClassName = '',
  className = '',
  style,
  onSubmit,
  onReset,
  onChange,
  onErrors,
}, ref) => {
  // 初始化表单 hook，管理所有表单状态和逻辑
  const form = useForm({
    fields,
    onSubmit,
    onChange,
    onErrors,
  });

  // 从表单 hook 解构所有需要的状态和方法
  const {
    values,        // 表单当前值对象
    errors,        // 验证错误对象
    touched,       // 用户交互过的字段标记
    handleFieldChange,  // 字段值变更处理器
    handleFieldBlur,    // 字段失焦处理器
    reset,         // 重置表单方法
    submit,        // 提交表单方法
    setValue,      // 设置单个字段值
    setValues,     // 设置多个字段值
    getValue,      // 获取单个字段值
    getValues,     // 获取所有字段值
    getErrors,     // 获取所有错误
    setError,      // 设置错误
    clearErrors,   // 清空错误
    validate,      // 表单验证
    validateField, // 单个字段验证
  } = form;

  // 暴露表单实例方法给父组件使用
  useImperativeHandle(ref, () => ({
    submit,
    reset,
    validate,
    setValue,
    getValue,
    getValues,
    setValues,
    getErrors,
    setError,
    clearErrors,
  }));

  // 表单提交事件处理器
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();  // 阻止默认表单提交行为
    submit();           // 调用内部提交方法
  };

  // 表单重置事件处理器
  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();  // 阻止默认重置行为
    reset();            // 重置表单状态
    onReset?.();        // 调用配置的重置回调
  };

  // 根据条件和依赖关系过滤可见字段
  const visibleFields = fields.filter(field => {
    // 检查字段显示条件
    if (field.condition && !field.condition(values)) {
      return false; // 条件不满足，隐藏字段
    }
    return true; // 显示字段
  });

  // 组合最终的 CSS 类名
  const containerClassName = `custom-form ${layout} ${size} ${className}`;

  return (
    <form
      className={containerClassName}
      style={style}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {/* 表单头部区域 */}
      <div className="form-header">
        <h3 className="form-title">表单信息</h3>
      </div>

      {/* 表单内容区域 */}
      <div className="form-content">
        {/* 渲染所有可见字段 */}
        {visibleFields.map(field => {
          // 计算字段错误和触摸状态
          const fieldError = errors[field.name];
          const isTouched = touched[field.name];
          const hasError = fieldError && isTouched; // 只在用户交互后显示错误

          return (
            // 渲染单个表单字段
            <FormField
              key={field.name}
              field={field}
              value={values[field.name]}           // 当前字段值
              error={hasError ? fieldError : undefined} // 错误信息
              onChange={(value: any) => handleFieldChange(field.name, value)} // 变化处理
              onBlur={() => handleFieldBlur(field.name)}   // 失焦处理
              onFocus={() => {}}                          // 聚焦处理 (占位符)
            />
          );
        })}
      </div>

      {/* 表单操作按钮区域 */}
      <div className="form-actions">
        {/* 提交按钮 */}
        <button
          type="submit"
          className={`form-submit-btn ${submitButtonClassName}`}
          disabled={Object.keys(errors).some(key => errors[key] && touched[key])} // 有错误时禁用
        >
          {submitText}
        </button>

        {/* 条件显示重置按钮 */}
        {showReset && (
          <button
            type="reset"
            className={`form-reset-btn ${resetButtonClassName}`}
          >
            {resetText}
          </button>
        )}
      </div>

      {/* 表单底部状态区域 */}
      <div className="form-footer">
        <div className="form-status">
          {/* 显示表单错误汇总 */}
          {Object.keys(errors).length > 0 && (
            <div className="form-errors-summary">
              表单中有 {Object.keys(errors).length} 个错误需要修正
            </div>
          )}
        </div>
      </div>
    </form>
  );
});

// 设置显示名称，方便调试和错误追踪
CustomForm.displayName = 'CustomForm';

export default CustomForm;
