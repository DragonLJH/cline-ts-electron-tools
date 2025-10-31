import React from 'react';
import { FormField as FormFieldType } from './types';
import { default as CustomSelect } from '../CustomSelect';
import { default as CustomCheckbox } from '../CustomCheckbox';
import { default as CustomRadioGroup } from '../CustomRadio';
import { default as CustomSwitch } from '../CustomSwitch';
import { default as CustomInput, SearchInput, FileInput } from '../CustomInput';

interface FormFieldProps {
  field: FormFieldType;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
  onFocus
}) => {
  // 确定字段验证状态
  const hasValue = value !== undefined && value !== null && value !== '';
  const hasError = error;
  const isValid = hasValue && !hasError;

  // 构建动态className
  const fieldClassName = `
    form-field
    ${field.className || ''}
    ${field.layout || ''}
    ${field.size || ''}
    ${hasError ? 'field-error' : ''}
    ${isValid ? 'field-valid' : ''}
    ${hasValue && !hasError ? 'field-dirty' : ''}
  `.trim();

  const labelClassName = `
    form-label
    ${field.required ? 'required' : ''}
    ${hasError ? 'label-error' : ''}
    ${isValid ? 'label-valid' : ''}
  `.trim();

  const inputClassName = `
    form-input
    ${hasError ? 'error' : ''}
    ${isValid ? 'success' : ''}
    ${field.size || ''}
  `.trim();

  // 创建输入类型到组件的对象映射，提高性能和可维护性
  const inputRenderers = {
    text: (props: any) => (
      <CustomInput
        {...props}
        field={field}
        type="text"
        variant="outlined"
        error={hasError}
        value={value?.toString() || ''}
      />
    ),
    email: (props: any) => (
      <CustomInput
        {...props}
        field={field}
        type="email"
        variant="outlined"
        error={hasError}
        value={value?.toString() || ''}
      />
    ),
    password: (props: any) => (
      <CustomInput
        {...props}
        field={field}
        type="password"
        variant="outlined"
        error={hasError}
        value={value?.toString() || ''}
      />
    ),
    number: (props: any) => (
      <CustomInput
        {...props}
        field={field}
        type="number"
        variant="outlined"
        error={hasError}
        value={value?.toString() || ''}
        onChange={(newValue) => {
          const numValue = newValue === '' ? 0 : parseFloat(newValue) || 0;
          onChange(numValue);
        }}
      />
    ),
    textarea: (props: any) => (
      <textarea
        {...props}
        field={field}
        rows={4}
        className={`
          w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg
          font-medium text-gray-900 placeholder-gray-400
          transition-all duration-200 ease-in-out
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          resize-vertical min-h-[100px]
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : ''}
          ${field.size === 'small' ? 'px-3 py-2 text-sm min-h-[80px]' : ''}
          ${field.size === 'large' ? 'px-4 py-4 text-lg min-h-[120px]' : ''}
        `}
        value={value || ''}
      />
    ),
    select: () => <CustomSelect
      field={field}
      value={value}
      error={error}
      onChange={onChange}
      onBlur={onBlur}
    />,
    checkbox: () => <CustomCheckbox field={field} value={value} onChange={onChange} />,
    radio: () => <CustomRadioGroup field={field} value={value} onChange={onChange} />,
    switch: () => <CustomSwitch field={field} value={value} onChange={onChange} />,
    date: (props: any) => (
      <CustomInput
        {...props}
        field={field}
        type="text" // 使用text而不是date，因为date样式不好控制
        variant="outlined"
        error={hasError}
        leftIcon={<span className="text-gray-500">📅</span>}
        placeholder="YYYY-MM-DD"
        value={value?.toString() || ''}
      />
    ),
    time: (props: any) => (
      <CustomInput
        {...props}
        field={field}
        type="text" // 使用text而不是time，因为time样式不好控制
        variant="outlined"
        error={hasError}
        leftIcon={<span className="text-gray-500">🕐</span>}
        placeholder="HH:MM"
        value={value?.toString() || ''}
      />
    ),
    search: () => <SearchInput
      value={value?.toString() || ''}
      onChange={(newValue) => onChange(newValue)}
      placeholder={field.placeholder}
      disabled={field.disabled}
    />,
    file: () => <FileInput
      onFileSelect={(files) => onChange(files)}
      placeholder={field.placeholder}
      disabled={field.disabled}
      clearable={true}
      showFileName={true}
      showFileSize={true}
    />,
  };

  const renderInput = () => {
    // 通用输入控件属性
    const commonProps = {
      id: field.name,
      name: field.name,
      value: value || '',
      placeholder: field.placeholder,
      disabled: field.disabled,
      readOnly: field.readOnly,
      className: inputClassName,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        onChange(e.target.value),
      onBlur: onBlur,
      onFocus: onFocus
    };

    // 通过对象映射获取对应的渲染函数，如果没有找到则使用默认的文本输入
    const renderer = inputRenderers[field.type] || inputRenderers.text;
    return renderer(commonProps);
  };

  return (
    <div className={fieldClassName} style={field.style}>
      {field.type !== 'checkbox' && field.type !== 'switch' && (
        <label htmlFor={field.name} className={labelClassName}>
          {field.label}
          {field.required && <span className="required-marker">*</span>}
        </label>
      )}

      {renderInput()}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {field.description && (
        <div className="form-description">
          {field.description}
        </div>
      )}

      {field.tooltip && (
        <div className="form-tooltip">
          ℹ️ {field.tooltip}
        </div>
      )}
    </div>
  );
};

export default FormField;
