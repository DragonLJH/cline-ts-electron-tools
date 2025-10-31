import React from 'react';
import { FormField } from '../CustomForm/types';
import './CustomCheckbox.scss';

interface CustomCheckboxProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
}

/**
 * 自定义复选框组件 - 完全不使用原生的 checkbox 元素
 *
 * 功能特性:
 * - 自定义外观和交互体验
 * - 支持选中/未选中/禁用状态
 * - 平滑的过渡动画
 * - 可访问性支持
 *
 * @param props - 组件属性
 * @returns 自定义复选框组件
 */
const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
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
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <label
      className={`flex items-center gap-3 cursor-pointer px-1 py-0.5 rounded-md transition-all duration-200 ease-in-out select-none ${
        field.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 hover:-mx-1'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={field.disabled ? -1 : 0}
      role="checkbox"
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
      <span className={`w-5 h-5 border-2 border-gray-300 rounded bg-white flex items-center justify-center transition-all duration-200 ease-in-out relative flex-shrink-0 ${
        value ?
          'border-blue-500 bg-blue-500' :
          field.disabled ?
            'cursor-not-allowed border-gray-400 bg-gray-50' :
            'hover:border-blue-400 hover:shadow-md hover:scale-105'
      } ${
        !value && !field.disabled ? 'hover:border-blue-400' : ''
      } ${
        value && !field.disabled ? 'before:w-2/3 before:h-2/3 before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:border-2 before:border-white before:border-t-0 before:border-l-0 before:rotate-45 before:-translate-x-1/2 before:-translate-y-1/2' : ''
      }`}>
        {value && <span className="text-white text-sm font-bold">✓</span>}
      </span>
      <span className={`text-gray-700 font-medium cursor-inherit select-none transition-colors duration-200 ${
        field.disabled ? 'text-gray-400' : 'hover:text-gray-900'
      }`}>
        {field.label}
      </span>
    </label>
  );
};

export default CustomCheckbox;
