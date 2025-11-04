import React, { memo } from 'react';
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

// 定义具有内部helpText显示能力的组件类型
const COMPONENTS_WITH_INTERNAL_HELP_TEXT: FormFieldType[] = [
  'input', 'password', 'email', 'number', 'range', 'date', 'textarea', 'checkbox'
];

// 基础输入类型映射
const INPUT_TYPE_MAP: Record<string, string> = {
  password: 'password',
  email: 'email',
  number: 'number',
  date: 'date',
  range: 'range'
} as const;

// 统一的输入组件渲染器
const renderInputField = (props: FormFieldProps) => (
  <Input
    fullWidth
    size={props.size}
    variant={props.variant}
    type={INPUT_TYPE_MAP[props.type] || 'text'}
    placeholder={props.placeholder}
    value={props.value}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onChange(e.target.value)}
    onBlur={props.onBlur}
    state={props.error && props.isTouched ? 'error' : 'normal'}
    disabled={props.disabled}
    step={props.step}
    min={props.min}
    max={props.max}
    className={props.className}
    style={props.style}
    helperText={props.error && props.isTouched ? props.error : undefined}
  />
);

// 组件外部的字段渲染器对象，避免每次渲染重新创建
const FIELD_RENDERERS: Partial<Record<FormFieldType, (props: FormFieldProps) => React.ReactElement>> = {
  input: renderInputField,
  password: renderInputField,
  email: renderInputField,
  number: renderInputField,
  range: renderInputField,
  date: renderInputField,

  textarea: (props) => (
    <>
      <textarea
        placeholder={props.placeholder}
        value={props.value || ''}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange(e.target.value)}
        onBlur={props.onBlur}
        disabled={props.disabled}
        rows={props.rows || 3}
        cols={props.cols}
        className={`
          w-full px-3 py-2 text-base border border-gray-300 rounded-md resize-vertical
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200 [-webkit-app-region:no-drag]
          ${props.error && props.isTouched ? 'border-red-500 focus:ring-red-500' : ''}
          ${props.className}
        `}
        style={props.style}
      />
      {(props.error && props.isTouched || props.helperText) && (
        <p className={`mt-1 text-sm ${props.error && props.isTouched ? 'text-red-600' : 'text-gray-500'}`}>
          {props.error && props.isTouched ? props.error : props.helperText}
        </p>
      )}
    </>
  ),

  select: (props) => (
    <div className={props.className} style={props.style}>
      <Select
        multiple={props.multiple}
        value={props.value}
        onChange={(newValue) => props.onChange(newValue)}
        placeholder={props.placeholder}
        disabled={props.disabled}
        size={props.size}
        clearable={!props.required}
      >
        {props.options?.map((option, index) => (
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
  ),

  radio: (props) => (
    <RadioGroup
      value={props.value}
      onChange={(newValue) => props.onChange(newValue)}
      disabled={props.disabled}
      size={props.size}
    >
      {props.options?.map((option, index) => (
        <RadioGroupItem
          key={`${option.value}-${index}`}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </RadioGroupItem>
      ))}
    </RadioGroup>
  ),

  checkbox: (props) => {
    if (props.multiple) {
      return (
        <CheckboxGroup
          value={props.value || []}
          onChange={(newValue) => props.onChange(newValue)}
          max={props.max}
        >
          {props.options?.map((option, index) => (
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
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`checkbox-${props.name}`}
            checked={Boolean(props.value)}
            onChange={(e) => props.onChange(e.target.checked)}
            onBlur={props.onBlur}
            disabled={props.disabled}
            className="
              w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500
              disabled:cursor-not-allowed disabled:opacity-50
              [-webkit-app-region:no-drag]
            "
          />
          <label
            htmlFor={`checkbox-${props.name}`}
            className={`
              text-sm font-medium ${props.disabled ? 'text-gray-400' : 'text-gray-700'}
              cursor-pointer select-none
            `}
          >
            {props.label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      );
    }
  },

  file: (props) => (
    <div className={props.className} style={props.style}>
      <FileInput
        value={props.value}
        onChange={(files) => props.onChange(files)}
        mode={props.multiple ? 'multiple' : 'single'}
        accept={props.accept}
        disabled={props.disabled}
        placeholder={props.placeholder}
        buttonText="选择文件"
      />
    </div>
  )
};

const FormField: React.FC<FormFieldProps> = memo((props) => {
  const {
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
  } = props;

  // 检查组件是否支持内部helpText显示
  const hasInternalHelpText = COMPONENTS_WITH_INTERNAL_HELP_TEXT.includes(type);

  // 渲染字段组件
  const renderField = () => {
    const renderer = FIELD_RENDERERS[type];
    return renderer ? renderer(props) : (
      <div className="text-red-500 text-sm">
        未知字段类型: {type}
      </div>
    );
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

      {/* 帮助文本 - 只为不具备内部显示能力的组件显示 */}
      {!hasInternalHelpText && (error || helperText) && (
        <p className={`mt-1 text-sm ${error && isTouched ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
