import React, { memo, useEffect } from 'react';
import { Input, FileInput } from '../Input';
import {
  RadioGroup,
  RadioGroupItem,
  CheckboxGroup,
  CheckboxGroupItem,
  Select,
  SelectOption
} from '../Selection';
import { FormFieldConfig, FormFieldType } from './Form';

// 表单字段属性
export interface FormFieldProps extends FormFieldConfig {
  value: any;
  error: string;
  isTouched: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}

const FormField: React.FC<FormFieldProps> = memo(({
  name,
  label,
  type,
  value,
  error,
  isTouched,
  onChange,
  onBlur,
  placeholder,
  required,
  disabled,
  options = [],
  multiple,
  accept,
  maxFileSize,
  step,
  min,
  max,
  rows,
  cols,
  size,
  variant,
  helperText,
  className = '',
  style
}) => {

  useEffect(() => {
    console.log('[FormField]', name,
      label, value)
  })
  // 获取输入类型对应的 HTML type
  const getInputType = (fieldType: FormFieldType): string => {
    switch (fieldType) {
      case 'password': return 'password';
      case 'email': return 'email';
      case 'number': return 'number';
      case 'date': return 'date';
      case 'range': return 'range';
      default: return 'text';
    }
  };

  // 渲染不同的字段类型
  const renderField = () => {
    switch (type) {
      case 'input':
      case 'password':
      case 'email':
      case 'number':
      case 'range':
      case 'date':
        return (
          <Input
            fullWidth
            size={size}
            variant={variant}
            type={getInputType(type)}
            placeholder={placeholder}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onBlur={onBlur}
            state={error && isTouched ? 'error' : 'normal'}
            disabled={disabled}
            step={step}
            min={min}
            max={max}
            className={className}
            style={style}
            helperText={error || helperText}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={placeholder}
            value={value || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            rows={rows || 3}
            cols={cols}
            className={`
              w-full px-3 py-2 text-base border border-gray-300 rounded-md resize-vertical
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:cursor-not-allowed disabled:opacity-50
              transition-all duration-200 [-webkit-app-region:no-drag]
              ${error && isTouched ? 'border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            style={style}
          />
        );

      case 'select':
        return (
          <div className={className} style={style}>
            <Select
              multiple={multiple}
              value={value}
              onChange={(newValue) => onChange(newValue)}
              placeholder={placeholder}
              disabled={disabled}
              size={size}
              clearable={!required}
            >
              {options.map((option, index) => (
                <SelectOption
                  key={`${option.value}-${index}`}
                  value={option.value}
                  label={option.label}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value}
            onChange={(newValue) => onChange(newValue)}
            disabled={disabled}
            size={size}
          >
            {options.map((option, index) => (
              <RadioGroupItem
                key={`${option.value}-${index}`}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        if (multiple) {
          // 多选复选框组
          return (
            <CheckboxGroup
              value={value || []}
              onChange={(newValue) => onChange(newValue)}
              max={max}
            >
              {options.map((option, index) => (
                <CheckboxGroupItem
                  key={`${option.value}-${index}`}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </CheckboxGroupItem>
              ))}
            </CheckboxGroup>
          );
        } else {
          // 单选复选框（布尔值）
          return (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`checkbox-${name}`}
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={onBlur}
                disabled={disabled}
                className="
                  w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500
                  disabled:cursor-not-allowed disabled:opacity-50
                  [-webkit-app-region:no-drag]
                "
              />
              <label
                htmlFor={`checkbox-${name}`}
                className={`
                  text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}
                  cursor-pointer select-none
                `}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          );
        }

      case 'file':
        return (
          <div className={className} style={style}>
            <FileInput
              value={value}
              onChange={(files) => onChange(files)}
              mode={multiple ? 'multiple' : 'single'}
              accept={accept}
              disabled={disabled}
              placeholder={placeholder}
              buttonText="选择文件"
            />
          </div>
        );

      default:
        return (
          <div className="text-red-500 text-sm">
            未知字段类型: {type}
          </div>
        );
    }
  };

  // 对于单选复选框，标签已在复选框内渲染
  if (type === 'checkbox' && !multiple) {
    return (
      <div className={className} style={style}>
        {renderField()}
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error && isTouched ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`form-field ${className}`} style={style}>
      {/* 字段标签 */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 字段组件 */}
      {renderField()}

      {/* 帮助文本 */}
      {type !== 'textarea' && (error || helperText) && (
        <p className={`mt-1 text-sm ${error && isTouched ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
