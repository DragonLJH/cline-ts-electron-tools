import React, { forwardRef, useCallback } from 'react';

export type CheckboxSize = 'small' | 'medium' | 'large';

export interface CheckboxProps {
  checked?: boolean;
  value?: string | number;
  disabled?: boolean;
  size?: CheckboxSize;
  indeterminate?: boolean; // 不确定状态
  onChange?: (checked: boolean, value?: string | number) => void;
  children?: React.ReactNode;
  className?: string;
}

const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(({
  checked = false,
  value,
  disabled = false,
  size = 'medium',
  indeterminate = false,
  onChange,
  children,
  className = '',
  ...props
}, ref) => {
  const handleClick = useCallback(() => {
    if (!disabled && onChange) {
      onChange(!checked, value);
    }
  }, [disabled, checked, onChange, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onChange) {
      e.preventDefault();
      onChange(!checked, value);
    }
  }, [disabled, checked, onChange, value]);

  // 根据尺寸设置类名
  const sizeClasses = {
    small: {
      wrapper: 'min-h-[1.5rem]',
      checkbox: 'w-4 h-4',
      checkmark: checked && !indeterminate ? 'w-3 h-2' : indeterminate ? 'w-2 h-0.5' : 'w-0 h-0'
    },
    medium: {
      wrapper: 'min-h-[2rem]',
      checkbox: 'w-5 h-5',
      checkmark: checked && !indeterminate ? 'w-3.5 h-2.5' : indeterminate ? 'w-2.5 h-0.5' : 'w-0 h-0'
    },
    large: {
      wrapper: 'min-h-[2.5rem]',
      checkbox: 'w-6 h-6',
      checkmark: checked && !indeterminate ? 'w-4 h-3' : indeterminate ? 'w-3 h-0.5' : 'w-0 h-0'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      ref={ref}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
        [-webkit-app-region:no-drag]
        ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}
        ${currentSize.wrapper}
        ${className}
      `}
      {...props}
    >
      {/* 复选框外观 */}
      <div
        className={`
          ${currentSize.checkbox}
          rounded border-2 flex items-center justify-center transition-all duration-200 mr-3 flex-shrink-0
          ${
            disabled
              ? 'border-gray-300 bg-gray-50'
              : checked || indeterminate
              ? 'border-blue-600 bg-blue-600'
              : 'border-gray-300 bg-white group-hover:border-blue-400'
          }
        `}
      >
        {/* 勾选图标 */}
        {(checked || indeterminate) && (
          <svg
            className={`
              ${currentSize.checkmark}
              transition-all duration-150 text-white
            `}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={indeterminate ? 2 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {indeterminate ? (
              <path d="M4 8h8" />
            ) : (
              <polyline points="4,8 8,12 12,4" />
            )}
          </svg>
        )}
      </div>

      {/* 标签内容 */}
      {children && (
        <span className={`
          text-sm font-medium transition-colors
          ${disabled ? 'text-gray-400' : checked || indeterminate ? 'text-gray-900' : 'text-gray-700'}
        `}>
          {children}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
