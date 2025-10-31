import React from 'react';
import { FormField, SelectOption } from '../CustomForm/types';
import './CustomRadio.scss';

interface CustomRadioGroupProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
}

/**
 * 自定义单选按钮组组件 - 完全不使用原生的 radio 元素
 *
 * 功能特性:
 * - 自定义外观和交互体验
 * - 支持选项选择和禁用状态
 * - 无障碍键盘导航
 * - 平滑的过渡动画
 *
 * @param props - 组件属性
 * @returns 自定义单选按钮组组件
 */
const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
  field,
  value,
  onChange
}) => (
  <div className="flex flex-col gap-2" role="radiogroup">
    {field.options?.map((option: SelectOption) => {
      const isSelected = value === option.value;
      const isDisabled = option.disabled;

      return (
        <label
          key={option.value}
          className={`flex items-center gap-3 cursor-pointer px-1 py-0.5 rounded-md transition-all duration-200 ease-in-out select-none ${
            isSelected ?
              'bg-blue-50/50' :
              !isDisabled ?
                'hover:bg-gray-50 hover:-mx-1' :
                ''
          } ${
            isDisabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          onClick={() => !isDisabled && onChange(option.value)}
          onKeyDown={(e) => {
            if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onChange(option.value);
            }
          }}
          tabIndex={isDisabled ? -1 : 0}
          role="radio"
          aria-checked={isSelected}
          aria-disabled={isDisabled}
        >
          <input
            type="radio"
            name={field.name}
            value={option.value}
            className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
            style={{ display: 'none' }}
            checked={isSelected}
            onChange={() => onChange(option.value)}
            disabled={isDisabled}
          />
          <span className={`w-5 h-5 border-2 border-gray-300 rounded-full bg-white flex items-center justify-center transition-all duration-200 ease-in-out relative flex-shrink-0 ${
            isSelected ?
              'border-blue-500 bg-blue-50' :
              isDisabled ?
                'border-gray-400 bg-gray-50' :
                'hover:border-blue-400 hover:shadow-md hover:scale-105'
          }`}>
            <span className={`w-2 h-2 rounded-full bg-blue-500 transition-all duration-200 ease-in-out ${
              isSelected ? 'scale-100' : 'scale-0'
            }`}></span>
          </span>
          <span className={`text-gray-700 font-medium cursor-inherit select-none transition-colors duration-200 ${
            isSelected ? 'text-blue-900 font-semibold' : ''
          }`}>{option.label}</span>
        </label>
      );
    })}
  </div>
);

export default CustomRadioGroup;
