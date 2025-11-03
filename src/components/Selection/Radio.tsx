import React, { forwardRef, useCallback } from 'react';

export type RadioSize = 'small' | 'medium' | 'large';

export interface RadioProps {
  checked?: boolean;
  value?: string | number;
  disabled?: boolean;
  size?: RadioSize;
  onChange?: (value: string | number | undefined) => void;
  children?: React.ReactNode;
  className?: string;
  name?: string; // 用于关联 RadioGroup
}

const Radio = forwardRef<HTMLDivElement, RadioProps>(({
  checked = false,
  value,
  disabled = false,
  size = 'medium',
  onChange,
  children,
  className = '',
  name,
  ...props
}, ref) => {
  const handleClick = useCallback(() => {
    if (!disabled && !checked && onChange) {
      onChange(value);
    }
  }, [disabled, checked, onChange, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !checked && onChange) {
      e.preventDefault();
      onChange(value);
    }
  }, [disabled, checked, onChange, value]);

  // 根据尺寸设置类名
  const sizeClasses = {
    small: {
      wrapper: 'min-h-[1.5rem]',
      radio: 'w-4 h-4',
      dot: checked ? 'w-2 h-2' : 'w-0 h-0'
    },
    medium: {
      wrapper: 'min-h-[2rem]',
      radio: 'w-5 h-5',
      dot: checked ? 'w-2.5 h-2.5' : 'w-0 h-0'
    },
    large: {
      wrapper: 'min-h-[2.5rem]',
      radio: 'w-6 h-6',
      dot: checked ? 'w-3 h-3' : 'w-0 h-0'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      ref={ref}
      role="radio"
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
      {/* 单选框外观 */}
      <div
        className={`
          ${currentSize.radio}
          rounded-full border-2 flex items-center justify-center transition-all duration-200 mr-3 flex-shrink-0
          ${
            disabled
              ? 'border-gray-300 bg-gray-50'
              : checked
              ? 'border-blue-600 bg-white'
              : 'border-gray-300 bg-white group-hover:border-blue-400'
          }
        `}
      >
        {/* 内圈 */}
        <div
          className={`
            rounded-full transition-all duration-150
            ${
              disabled
                ? 'bg-gray-400'
                : checked
                ? 'bg-blue-600'
                : 'bg-transparent'
            }
            ${currentSize.dot}
          `}
        />
      </div>

      {/* 标签内容 */}
      {children && (
        <span className={`
          text-sm font-medium transition-colors
          ${disabled ? 'text-gray-400' : checked ? 'text-gray-900' : 'text-gray-700'}
        `}>
          {children}
        </span>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export default Radio;
