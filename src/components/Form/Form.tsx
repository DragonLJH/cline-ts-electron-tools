import React, { useState, useCallback, FormEvent, useEffect, useMemo } from 'react';
import { Button } from '../Commom';
import FormField from './FormField';

// 表单字段类型
export type FormFieldType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'range'
  | 'date'
  | 'password'
  | 'email'
  | 'number';

// 验证规则
export interface FormValidationRules {
  required?: {
    value: boolean;
    message: string;
  };
  minLength?: {
    value: number;
    message: string;
  };
  maxLength?: {
    value: number;
    message: string;
  };
  min?: {
    value: number;
    message: string;
  };
  max?: {
    value: number;
    message: string;
  };
  pattern?: {
    value: RegExp;
    message: string;
  };
  custom?: {
    validate: (value: any, formData?: Record<string, any>) => boolean | Promise<boolean>;
    message: string;
  };
}

// 表单字段配置
export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: FormValidationRules;
  defaultValue?: any;
  options?: Array<{ label: string; value: any; disabled?: boolean }>; // for select, radio, checkbox
  multiple?: boolean; // for select, checkbox, file
  accept?: string; // for file input
  maxFileSize?: number; // for file input, in bytes
  step?: number; // for number input
  min?: number; // for number/range input
  max?: number; // for number/range input
  rows?: number; // for textarea
  cols?: number; // for textarea
  size?: 'small' | 'medium' | 'large'; // component size
  variant?: 'default' | 'filled'; // input variant
  helperText?: string; // additional help text
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  }; // responsive grid layout
  className?: string;
  style?: React.CSSProperties;
}

// 表单组件属性
export interface FormProps {
  fields: FormFieldConfig[];
  onSubmit: (values: Record<string, any>, event?: FormEvent) => void;
  onChange?: (name: string, value: any, formData: Record<string, any>) => void;
  onError?: (errors: Record<string, string>) => void;
  onValidate?: (isValid: boolean, errors: Record<string, string>) => void;
  initialValues?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  disabled?: boolean;
  loading?: boolean;
  submitButton?: {
    text: string;
    variant?: 'filled' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    style?: React.CSSProperties;
  };
  resetButton?: {
    text: string;
    variant?: 'filled' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    size?: 'small' | 'medium' | 'large';
    className?: string;
    style?: React.CSSProperties;
  };
  layout?: 'vertical' | 'horizontal' | 'inline'; // form layout
  labelWidth?: string | number; // label width for horizontal layout
  gridColumns?: number; // number of grid columns
  gap?: 'small' | 'medium' | 'large'; // spacing between fields
  className?: string;
  style?: React.CSSProperties;
  showRequiredMark?: boolean; // show * for required fields
}

const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  onChange,
  onError,
  onValidate,
  initialValues = {},
  validateOnChange = false,
  validateOnBlur = false,
  validateOnSubmit = true,
  disabled = false,
  loading = false,
  submitButton,
  resetButton,
  layout = 'vertical',
  labelWidth = 120,
  gridColumns = 1,
  gap = 'medium',
  className = '',
  style = {},
  showRequiredMark = true
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name] = field.defaultValue !== undefined ? field.defaultValue :
        initialValues[field.name] !== undefined ? initialValues[field.name] : '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用 useMemo 优化样式类计算，避免每次渲染都重新计算
  const getGapClass = useMemo(() => {
    switch (gap) {
      case 'small': return 'gap-2';
      case 'large': return 'gap-6';
      default: return 'gap-4';
    }
  }, [gap]);

  const getLayoutClass = useMemo(() => {
    const baseClasses = 'w-full';
    const gapClasses = getGapClass;

    switch (layout) {
      case 'horizontal':
        return `${baseClasses} ${gapClasses}`;
      case 'inline':
        return `${baseClasses} flex flex-wrap items-end ${gapClasses}`;
      default: // vertical
        return `${baseClasses} space-y-4`;
    }
  }, [layout, gap]);

  // 验证单个字段
  const validateField = useCallback(async (fieldName: string, value: any, allData = formData): Promise<string | null> => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return null;

    const { validation, required } = field;

    // 空值检查
    if (required && (value === '' || value === null || value === undefined ||
      (Array.isArray(value) && value.length === 0))) {
      return `${field.label}不能为空`;
    }

    // 如果值为空且非必填，跳过其他验证
    if (!required && (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0))) {
      return null;
    }

    if (!validation) return null;

    // 字符串长度验证
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength.value) {
        return validation.minLength.message || `最少${validation.minLength.value}个字符`;
      }
      if (validation.maxLength && value.length > validation.maxLength.value) {
        return validation.maxLength.message || `最多${validation.maxLength.value}个字符`;
      }
    }

    // 数值范围验证
    if (typeof value === 'number') {
      if (validation.min && value < validation.min.value) {
        return validation.min.message || `不能小于${validation.min.value}`;
      }
      if (validation.max && value > validation.max.value) {
        return validation.max.message || `不能大于${validation.max.value}`;
      }
    }

    // 正则表达式验证
    if (validation.pattern && typeof value === 'string') {
      if (!validation.pattern.value.test(value)) {
        return validation.pattern.message;
      }
    }

    // 自定义验证
    if (validation.custom) {
      try {
        const isValid = await validation.custom.validate(value, allData);
        if (!isValid) {
          return validation.custom.message;
        }
      } catch (error) {
        return validation.custom.message;
      }
    }

    return null;
  }, [fields, formData]);

  // 验证所有字段
  const validateAllFields = useCallback(async (data = formData): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const field of fields) {
      const error = await validateField(field.name, data[field.name], data);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    onValidate?.(isValid, newErrors);
    onError?.(newErrors);

    return isValid;
  }, [fields, formData, validateField, onValidate, onError]);

  // 字段值变化处理
  const handleFieldChange = useCallback((name: string, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };

      if (validateOnChange) {
        validateField(name, value, newFormData);
      }

      // 使用更新后的formData调用回调
      onChange?.(name, value, newFormData);
      return newFormData;
    });
  }, [validateOnChange, validateField, onChange]);

  // 字段失焦处理
  const handleFieldBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validateOnBlur) {
      validateField(name, formData[name]);
    }
  }, [formData, validateOnBlur, validateField]);

  // 重置表单
  const handleReset = useCallback(() => {
    const resetData: Record<string, any> = {};
    fields.forEach(field => {
      resetData[field.name] = field.defaultValue !== undefined ? field.defaultValue :
        initialValues[field.name] !== undefined ? initialValues[field.name] : '';
    });
    setFormData(resetData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [fields, initialValues]);

  // 提交表单
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    if (isSubmitting || disabled || loading) return;

    setIsSubmitting(true);

    try {
      const isValid = validateOnSubmit ? await validateAllFields() : true;

      if (isValid) {
        await onSubmit(formData, e);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    disabled,
    loading,
    validateOnSubmit,
    validateAllFields,
    onSubmit,
    formData
  ]);

  // 获取字段配置
  const getFieldConfig = useCallback((field: FormFieldConfig) => ({
    ...field,
    isTouched: touched[field.name] || false,
    error: errors[field.name] || '',
    value: formData[field.name],
    onChange: (value: any) => handleFieldChange(field.name, value),
    onBlur: () => handleFieldBlur(field.name)
  }), [formData, errors, touched, handleFieldChange, handleFieldBlur]);

  // 根据字段类型渲染不同组件
  const renderFieldComponent = useCallback((field: FormFieldConfig) => {
    const fieldConfig = getFieldConfig(field);
    return <FormField key={field.name} {...fieldConfig} />;
  }, [getFieldConfig]);

  // 初始化表单数据
  // useEffect(() => {
  //   const initial: Record<string, any> = {};
  //   fields.forEach(field => {
  //     // 每次都重新计算初始值，确保 initialValues 的改变能生效
  //     initial[field.name] = initialValues[field.name] !== undefined ? initialValues[field.name] :
  //       field.defaultValue !== undefined ? field.defaultValue : '';
  //   });
  //   setFormData(initial);
  //   // 重置错误和触摸状态，因为数据重新初始化了
  //   setErrors({});
  //   setTouched({});
  // }, [fields, initialValues]); // 依赖于 fields 和 initialValues，当它们改变时重新初始化

  return (
    <form
      onSubmit={handleSubmit}
      className={`form ${className}`}
      style={style}
    >
      <div
        className={getLayoutClass}
        style={gridColumns > 1 ? { display: 'grid', gridTemplateColumns: `repeat(${gridColumns}, 1fr)` } : undefined}
      >
        {fields.map(field => renderFieldComponent(field))}
      </div>

      {/* 按钮区域 */}
      {(submitButton || resetButton) && (
        <div className="flex gap-3 justify-start pt-4">
          {submitButton && (
            <Button
              type="submit"
              color={submitButton.color || 'primary'}
              variant={submitButton.variant || 'filled'}
              size={submitButton.size || 'medium'}
              disabled={submitButton.disabled || disabled || loading || isSubmitting}
              loading={submitButton.loading || loading || isSubmitting}
              className={submitButton.className}
              style={submitButton.style}
            >
              {submitButton.text}
            </Button>
          )}

          {resetButton && (
            <Button
              type="button"
              color={resetButton.color || 'secondary'}
              variant={resetButton.variant || 'outlined'}
              size={resetButton.size || 'medium'}
              onClick={handleReset}
              className={resetButton.className}
              style={resetButton.style}
            >
              {resetButton.text}
            </Button>
          )}
        </div>
      )}
    </form>
  );
};

export default Form;
