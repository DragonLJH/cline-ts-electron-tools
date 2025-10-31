import React, { useState, useRef, useEffect } from 'react';
import { FormField, SelectOption } from '../CustomForm/types';
import './CustomSelect.scss';

interface CustomSelectProps {
  field: FormField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur?: () => void;
}

/**
 * 自定义选择器组件 - 完全不使用原生的 select 元素
 *
 * 功能特性:
 * - 自定义下拉外观和交互
 * - 支持选项禁用
 * - 点击外部关闭下拉列表
 * - 自定义样式和动效
 * - 无障碍友好
 *
 * @param props - 组件属性
 * @returns 自定义选择器组件
 */
const CustomSelect: React.FC<CustomSelectProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('请选择');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (field.options) {
      const selectedOption = field.options.find((opt: SelectOption) => opt.value === value);
      setSelectedLabel(selectedOption?.label || '请选择');
    }
  }, [value, field.options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setSelectedLabel(option.label);
      setIsOpen(false);
      onBlur?.();
    }
  };

  const handleClearSelection = () => {
    onChange('');
    setSelectedLabel('请选择');
    setIsOpen(false);
    onBlur?.();
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`w-full min-h-12 px-3 py-3 pr-10 border-2 border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer flex items-center justify-between transition-all duration-200 ease-in-out select-none ${
          error ?
            'border-red-300 bg-red-50 text-red-900' :
            'hover:border-blue-400 hover:shadow-sm hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        } ${isOpen ? 'border-blue-500 shadow-sm' : ''}`}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      >
        <span className="flex-1 text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis">
          {selectedLabel}
        </span>
        <span className={`text-gray-500 text-sm transition-transform duration-200 ease-in-out ml-2 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 bg-white border-2 border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-600 animate-fade-in"
          role="listbox"
          aria-label="Options"
        >
          <div
            className="px-3 py-2 text-gray-700 cursor-pointer transition-colors duration-150 border-b border-gray-200 last:border-b-0 italic hover:bg-gray-100"
            onClick={handleClearSelection}
            role="option"
            aria-selected={value === ''}
          >
            请选择
          </div>
          {field.options?.map((option: SelectOption) => (
            <div
              key={option.value}
              className={`px-3 py-2 text-gray-700 cursor-pointer transition-colors duration-150 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 ${
                option.disabled ?
                  'text-gray-400 cursor-not-allowed bg-gray-50' :
                  value === option.value ?
                    'bg-blue-50 text-blue-900 font-medium' :
                    ''
              }`}
              onClick={() => handleOptionClick(option)}
              role="option"
              aria-selected={value === option.value}
              aria-disabled={option.disabled}
            >
              {option.label}
              {value === option.value && (
                <span className="text-blue-500 font-bold ml-auto">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
