import React from 'react';
import { FormField } from '../CustomForm/types';
import './CustomSwitch.scss';

interface CustomSwitchProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
}

/**
 * 自定义开关组件 - 完全不使用原生的 checkbox 元素
 *
 * 功能特性:
 * - 自定义外观和交互体验
 * - 平滑的切换动画
 * - 支持开启/关闭状态
 * - 无障碍键盘导航
 * - 可访问性支持
 *
 * @param props - 组件属性
 * @returns 自定义开关组件
 */
const CustomSwitch: React.FC<CustomSwitchProps> = ({
  field,
  value,
  onChange
}) => {
  const handleClick = () => {
    if (!field.disabled) {
      onChange(!value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!field.disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <label
      className={`flex items-center gap-3 transition-all duration-200 ease-in-out ${
        field.disabled ?
          'opacity-60 cursor-not-allowed' :
          'cursor-pointer hover:scale-105'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={field.disabled ? -1 : 0}
      role="switch"
      aria-checked={!!value}
      aria-disabled={!!field.disabled}
    >
      <input
        type="checkbox"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
        style={{ display: 'none' }}
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={field.disabled}
      />
      <span className={`relative w-12 h-6 bg-gray-300 rounded-full transition-all duration-300 ease-in-out cursor-pointer shadow-inner overflow-hidden ${
        value ?
          'bg-blue-500 shadow-inner' :
          field.disabled ?
            'bg-gray-300 cursor-not-allowed' :
            ''
      } ${
        field.disabled && value ? 'bg-gray-400' : ''
      }`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ease-in-out shadow-md ${
          value ?
            `${field.disabled ? 'bg-gray-200' : 'bg-white'} translate-x-6` :
            `${field.disabled ? 'bg-gray-200' : 'bg-white'} left-0.5`
        }`}></span>
        <span className={`absolute top-1/2 text-xs font-bold select-none transition-all duration-300 ease-in-out ${
          value ?
            (field.disabled ? 'text-gray-400' : 'text-white') + ' left-0.5' :
            'text-gray-500 right-1.5'
        }`} style={{ transform: 'translateY(-50%)' }}>
          {value ? '✓' : '✕'}
        </span>
      </span>
      <span className={`text-gray-700 font-medium select-none cursor-pointer transition-colors duration-200 ${
        field.disabled ? 'text-gray-400' : ''
      }`}>
        {field.label}
      </span>
    </label>
  );
};

export default CustomSwitch;
