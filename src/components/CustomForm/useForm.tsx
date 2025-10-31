import { useState, useCallback, useEffect } from 'react';
import { FormField, ValidationRule } from './types';

interface UseFormOptions {
  fields: FormField[];
  onSubmit?: (values: Record<string, any>) => void;
  onChange?: (values: Record<string, any>) => void;
  onErrors?: (errors: Record<string, string>) => void;
  initialValues?: Record<string, any>;
}

/**
 * 单字段验证函数
 * @param value - 要验证的值
 * @param validation - 验证规则数组
 * @returns 验证失败时的错误消息，若通过则返回 undefined
 */
const validateField = (value: any, validation: ValidationRule[]): string | undefined => {
  // 创建验证规则到验证函数的对象映射，提高性能和可维护性
  const ruleValidators: Record<string, (rule: ValidationRule) => string | undefined> = {
    required: (rule) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return rule.message;
      }
      return undefined;
    },

    min: (rule) => {
      if (typeof value === 'number' && value < (rule as any).value) {
        return rule.message;
      }
      return undefined;
    },

    max: (rule) => {
      if (typeof value === 'number' && value > (rule as any).value) {
        return rule.message;
      }
      return undefined;
    },

    minLength: (rule) => {
      if (typeof value === 'string' && value.length < (rule as any).value) {
        return rule.message;
      }
      return undefined;
    },

    maxLength: (rule) => {
      if (typeof value === 'string' && value.length > (rule as any).value) {
        return rule.message;
      }
      return undefined;
    },

    pattern: (rule) => {
      if (typeof value === 'string' && !(rule as any).value.test(value)) {
        return rule.message;
      }
      return undefined;
    },

    custom: (rule) => {
      if (!(rule as any).validator(value)) {
        return rule.message;
      }
      return undefined;
    },
  };

  // 依次检查每个验证规则，使用对象映射调用对应的验证函数
  for (const rule of validation) {
    const validator = ruleValidators[rule.type];
    if (validator) {
      const error = validator(rule);
      if (error) {
        return error;
      }
    }
  }

  return undefined; // 验证通过
};

/**
 * 表单整体验证函数
 * @param values - 表单当前值对象
 * @param fields - 表单字段配置数组
 * @returns 包含所有验证错误的对象，字段名 -> 错误信息
 */
const validateForm = (values: Record<string, any>, fields: FormField[]): Record<string, string> => {
  const errors: Record<string, string> = {};

  // 对每个字段进行验证
  fields.forEach(field => {
    const value = values[field.name];
    const fieldError = field.validation ? validateField(value, field.validation) : undefined;

    if (fieldError) {
      errors[field.name] = fieldError;
    }
  });

  return errors;
};

/**
 * 自定义表单状态管理 hook
 * 提供完整的表单状态管理、验证和事件处理功能
 *
 * @param options - 表单配置选项
 * @returns 表单状态和控制方法的集合
 *
 * @example
 * ```tsx
 * const form = useForm({ fields: formFields, onSubmit: handleSubmit });
 * const { values, errors, handleFieldChange, submit } = form;
 * ```
 */
export const useForm = ({
  fields,
  onSubmit,
  onChange,
  onErrors,
  initialValues = {},
}: UseFormOptions) => {
  // 表单值状态管理
  const [values, setValues] = useState<Record<string, any>>(() => {
    const defaultValues: Record<string, any> = {};
    fields.forEach(field => {
      if (field.name in initialValues) {
        defaultValues[field.name] = initialValues[field.name];
      } else if (field.defaultValue !== undefined) {
        defaultValues[field.name] = field.defaultValue;
      } else {
        // Set default values based on field type
        switch (field.type) {
          case 'checkbox':
          case 'switch':
            defaultValues[field.name] = false;
            break;
          case 'number':
            defaultValues[field.name] = 0;
            break;
          case 'select':
          case 'radio':
            defaultValues[field.name] = '';
            break;
          default:
            defaultValues[field.name] = '';
        }
      }
    });
    return { ...defaultValues, ...initialValues };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values, onChange]);

  useEffect(() => {
    if (onErrors) {
      onErrors(errors);
    }
  }, [errors, onErrors]);

  /**
   * 设置单个字段的值
   * @param name - 字段名称
   * @param value - 要设置的新值
   */
  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * 设置多个字段的值
   * @param newValues - 新的值对象
   */
  const setFormValues = useCallback((newValues: Record<string, any>) => {
    setValues(newValues);
  }, []);

  /**
   * 获取单个字段的值
   * @param name - 字段名称
   * @returns 字段的当前值
   */
  const getValue = useCallback((name: string) => {
    return values[name];
  }, [values]);

  /**
   * 获取所有字段的值
   * @returns 所有字段的值对象副本
   */
  const getValues = useCallback(() => {
    return { ...values };
  }, [values]);

  /**
   * 获取所有验证错误
   * @returns 所有错误的对象副本
   */
  const getErrors = useCallback(() => {
    return { ...errors };
  }, [errors]);

  /**
   * 设置单个字段的验证错误
   * @param name - 字段名称
   * @param error - 错误消息
   */
  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  /**
   * 清空所有验证错误
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * 验证整个表单的所有字段
   * @returns 表单是否验证通过
   */
  const validate = useCallback(() => {
    const newErrors = validateForm(values, fields);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, fields]);

  /**
   * 验证单个字段
   * @param name - 字段名称
   * @returns 字段是否验证通过
   */
  const validateSingleField = useCallback((name: string): boolean => {
    const field = fields.find(f => f.name === name);
    if (field) {
      const value = values[name];
      const fieldError: string | undefined = field.validation ? validateField(value, field.validation) : undefined;
      setErrors(prev => ({ ...prev, [name]: fieldError || '' }));
      return !fieldError;
    }
    return true;
  }, [values, fields]);

  /**
   * 处理字段值变化的内部事件处理器
   * @param name - 字段名称
   * @param value - 新值
   */
  const handleFieldChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // 如果字段已被触摸且有错误，当值变化时清除错误
    if (touched[name] && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [touched, errors]);

  /**
   * 处理字段失焦的内部事件处理器
   * @param name - 字段名称
   */
  const handleFieldBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateSingleField(name);
  }, [validateSingleField]);

  /**
   * 重置表单到初始状态
   * 清除所有值、错误和触摸状态
   */
  const reset = useCallback(() => {
    const defaultValues: Record<string, any> = {};
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultValues[field.name] = field.defaultValue;
      } else {
        switch (field.type) {
          case 'checkbox':
          case 'switch':
            defaultValues[field.name] = false;
            break;
          case 'number':
            defaultValues[field.name] = 0;
            break;
          default:
            defaultValues[field.name] = '';
        }
      }
    });
    setValues(defaultValues);
    setErrors({});
    setTouched({});
  }, [fields]);

  /**
   * 提交表单
   * 执行验证，如果验证通过则触发 onSubmit 回调
   * @returns 是否提交成功
   */
  const submit = useCallback(() => {
    const isValid = validate();
    if (isValid && onSubmit) {
      onSubmit(values);
    }
    return isValid;
  }, [validate, onSubmit, values]);

  return {
    values,
    errors,
    touched,
    setValue,
    setValues: setFormValues,
    getValue,
    getValues,
    getErrors,
    setError,
    clearErrors,
    validate,
    validateField: validateSingleField,
    handleFieldChange,
    handleFieldBlur,
    reset,
    submit,
  };
};
