import React, { forwardRef, useState } from 'react';
import { FormField } from '../CustomForm/types';
import './CustomInput.scss';

export interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'size'> {
  field?: FormField;
  value?: string;
  readonly?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * CustomInput 组件 - 完全自定义的输入框
 *
 * 特性:
 * - 去除所有浏览器默认样式
 * - 现代化的React风格设计
 * - 支持多种变体和尺寸
 * - 支持图标位置 (左侧/右侧)
 * - 支持状态反馈 (错误/禁用/只读)
 * - 无障碍友好
 */
const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({
  field,
  value = '',
  placeholder = '',
  disabled = false,
  readonly = false,
  error = false,
  size = 'md',
  variant = 'default',
  type = 'text',
  leftIcon,
  rightIcon,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // 优先使用field属性，然后使用独立props
  const effectiveName = field?.name || rest.name || '';
  const effectiveValue = field ? (onChange ? value : field.defaultValue || '') : inputValue;
  const effectivePlaceholder = field?.placeholder || placeholder;
  const effectiveDisabled = field?.disabled || disabled;
  const effectiveReadonly = readonly;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    field && onChange && onChange(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // 尺寸映射
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-4 text-lg'
  };

  // 变体映射
  const variantClasses = {
    default: `
      bg-white border-2 border-gray-300
      hover:border-gray-400
      ${isFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
    `,
    outlined: `
      bg-white border-2 border-gray-300 rounded-lg
      hover:border-gray-400 hover:shadow-sm
      ${isFocused ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' : ''}
    `,
    filled: `
      bg-gray-50 border-2 border-transparent
      hover:bg-gray-100 hover:border-gray-300
      ${isFocused ? 'bg-white border-blue-500 ring-2 ring-blue-500/20' : ''}
    `
  };

  return (
    <div className="relative w-full">
      {/* 左图标 */}
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400">
          {leftIcon}
        </div>
      )}

      {/* 输入框 */}
      <input
        ref={ref}
        type={type}
        name={effectiveName}
        value={effectiveValue}
        placeholder={effectivePlaceholder}
        disabled={effectiveDisabled}
        readOnly={effectiveReadonly}
        className={`
          reset-input
          font-medium text-gray-900 placeholder-gray-400
          transition-all duration-200 ease-in-out
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${effectiveReadonly ? 'bg-gray-50 text-gray-600 cursor-default' : ''}
          ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${leftIcon ? 'pl-10' : ''}
          ${rightIcon ? 'pr-10' : ''}
        `}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        {...rest}
      />

      {/* 右图标 */}
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400">
          {rightIcon}
        </div>
      )}

      {/* 错误线条动画 */}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-b
                        animate-pulse"></div>
      )}

      {/* 焦点线条动画 */}
      {isFocused && !error && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-b
                        animate-fade-in"></div>
      )}
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;
