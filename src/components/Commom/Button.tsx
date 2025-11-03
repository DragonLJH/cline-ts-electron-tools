import React, { forwardRef, useState } from 'react';

export type ButtonVariant = 'default' | 'filled' | 'outlined' | 'text';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonShape = 'default' | 'round' | 'circle';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  shape = 'default',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  children,
  className = '',
  onClick,
  ...props
}, ref) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [rippleId, setRippleId] = useState(0);

  // 处理点击涟漪效果
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // 创建涟漪效果
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const newRipple = {
      id: rippleId,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    setRipples(prev => [...prev, newRipple]);
    setRippleId(prev => prev + 1);

    // 3秒后移除涟漪
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 300);

    // 调用原有的onClick
    if (onClick && !loading && !disabled) {
      onClick(event);
    }
  };

  // 移除涟漪效果
  const removeRipple = (id: number) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  };

  // 生成基础样式
  const baseStyles = 'relative overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed font-medium [-webkit-app-region:no-drag] select-none';

  // 尺寸样式
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // 形状样式
  const shapeStyles = {
    default: '',
    round: 'rounded-full',
    circle: 'rounded-full p-0 w-10 h-10 flex items-center justify-center'
  };

  // 颜色和状态样式
  const getColorStyles = () => {
    const disabledStyles = 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500 border-gray-300 hover:bg-gray-300';

    if (loading || disabled) {
      return disabledStyles;
    }

    const colorMap = {
      primary: {
        filled: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 focus:ring-blue-500',
        outlined: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 focus:ring-blue-500',
        text: 'bg-transparent text-blue-600 hover:bg-blue-50 border-transparent focus:ring-blue-500'
      },
      secondary: {
        filled: 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600 focus:ring-gray-500',
        outlined: 'bg-transparent text-gray-600 border border-gray-600 hover:bg-gray-50 focus:ring-gray-500',
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 focus:ring-gray-500',
        text: 'bg-transparent text-gray-600 hover:bg-gray-50 border-transparent focus:ring-gray-500'
      },
      success: {
        filled: 'bg-green-600 text-white hover:bg-green-700 border-green-600 focus:ring-green-500',
        outlined: 'bg-transparent text-green-600 border border-green-600 hover:bg-green-50 focus:ring-green-500',
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 focus:ring-green-500',
        text: 'bg-transparent text-green-600 hover:bg-green-50 border-transparent focus:ring-green-500'
      },
      error: {
        filled: 'bg-red-600 text-white hover:bg-red-700 border-red-600 focus:ring-red-500',
        outlined: 'bg-transparent text-red-600 border border-red-600 hover:bg-red-50 focus:ring-red-500',
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 focus:ring-red-500',
        text: 'bg-transparent text-red-600 hover:bg-red-50 border-transparent focus:ring-red-500'
      },
      warning: {
        filled: 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500 focus:ring-yellow-500',
        outlined: 'bg-transparent text-yellow-600 border border-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 focus:ring-yellow-500',
        text: 'bg-transparent text-yellow-600 hover:bg-yellow-50 border-transparent focus:ring-yellow-500'
      },
      info: {
        filled: 'bg-cyan-500 text-white hover:bg-cyan-600 border-cyan-500 focus:ring-cyan-500',
        outlined: 'bg-transparent text-cyan-600 border border-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500',
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 focus:ring-cyan-500',
        text: 'bg-transparent text-cyan-600 hover:bg-cyan-50 border-transparent focus:ring-cyan-500'
      }
    };

    return colorMap[color][variant] || colorMap.primary.filled;
  };

  const colorStyles = getColorStyles();

  // 全宽度样式
  const widthStyles = fullWidth ? 'w-full' : '';

  // 合并所有样式
  const combinedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${shapeStyles[shape]}
    ${colorStyles}
    ${widthStyles}
    ${className}
  `;

  return (
    <button
      ref={ref}
      className={combinedClassName}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* 涟漪效果 */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white opacity-75 animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animation: 'ping 0.3s cubic-bezier(0, 0, 0.2, 1) forwards'
          }}
          onAnimationEnd={() => removeRipple(ripple.id)}
        />
      ))}

      {/* 按钮内容 */}
      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}

        {startIcon && !loading && !shape.includes('circle') && (
          <span className="flex-shrink-0">{startIcon}</span>
        )}

        {children && (!shape.includes('circle') || loading) && (
          <span className="tracking-wide">{children}</span>
        )}

        {endIcon && !loading && !shape.includes('circle') && (
          <span className="flex-shrink-0">{endIcon}</span>
        )}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
