import React, { forwardRef } from 'react';

export type InputVariant = 'default' | 'filled' | 'outlined';

export type InputState = 'normal' | 'error' | 'success';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  state?: InputState;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'outlined',
  state = 'normal',
  startIcon,
  endIcon,
  helperText,
  fullWidth = false,
  size = 'medium',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'flex items-center rounded-md border bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 [-webkit-app-region:no-drag]';

  const variantClasses = {
    default: 'border-gray-300 hover:border-gray-400',
    filled: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
    outlined: 'border-gray-300 shadow-sm hover:border-gray-400'
  };

  const stateClasses = {
    normal: 'border-gray-300',
    error: 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500',
    success: 'border-green-500 focus-within:ring-green-500 focus-within:border-green-500'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-3 py-2.5 text-lg'
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const hasStartIcon = startIcon !== undefined;
  const hasEndIcon = endIcon !== undefined;

  const inputClasses = `
    ${hasStartIcon ? 'pl-2' : 'pl-3'}
    ${hasEndIcon ? 'pr-2' : 'pr-3'}
    ${sizeClasses[size]}
    flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-700
    ${props.disabled ? 'cursor-not-allowed opacity-50' : ''}
  `.trim();

  const containerClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${state === 'normal' ? '' : stateClasses[state]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <div className={containerClasses}>
        {hasStartIcon && (
          <div className={`text-gray-400 flex-shrink-0 ${iconSizeClasses[size]}`}>
            {startIcon}
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {hasEndIcon && (
          <div className={`text-gray-400 flex-shrink-0 ${iconSizeClasses[size]}`}>
            {endIcon}
          </div>
        )}
      </div>
      {helperText && (
        <p className={`mt-1 text-sm ${
          state === 'error' ? 'text-red-600' :
          state === 'success' ? 'text-green-600' : 'text-gray-500'
        }`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
