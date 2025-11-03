import React, { forwardRef, useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/Input';

export type SelectSize = 'small' | 'medium' | 'large';

export interface SelectOptionProps {
  value: string | number;
  label: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const SelectOption: React.FC<SelectOptionProps> = ({ label, disabled, children, ...props }) => {
  return (
    <div
      role="option"
      aria-disabled={disabled}
      data-value={props.value}
      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
    >
      {children || label}
    </div>
  );
};

export interface SelectProps {
  value?: string | number | (string | number)[];
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  size?: SelectSize;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  max?: number;
  className?: string;
  children: React.ReactNode;
  onChange?: (value: string | number | (string | number)[]) => void;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(({
  value,
  multiple = false,
  placeholder = '请选择...',
  disabled = false,
  size = 'medium',
  searchable = false,
  clearable = false,
  loading = false,
  className = '',
  children,
  onChange,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 处理外部传入的 ref
  React.useImperativeHandle(ref, () => selectRef.current as HTMLDivElement);

  // 从 children 中提取选项
  const options = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<SelectOptionProps> =>
      React.isValidElement(child) && child.type === SelectOption
  );

  // 过滤选项（根据搜索）
  const filteredOptions = searchable && searchValue
    ? options.filter(option =>
        option.props.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        (option.props.children as string)?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : options;

  // 将 value 转为数组以统一处理
  const selectedValues = Array.isArray(value) ? value : (value !== undefined ? [value] : []);

  // 获取选中的选项标签
  const getSelectedLabels = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      const selectedOptions = options.filter(option => selectedValues.includes(option.props.value));
      return selectedOptions.map(option => option.props.label).join(', ');
    } else {
      const selectedOption = options.find(option => option.props.value === value);
      return selectedOption ? selectedOption.props.label : placeholder;
    }
  };

  // 处理选择
  const handleSelect = useCallback((optionValue: string | number) => {
    let newValue: string | number | (string | number)[];

    if (multiple) {
      const isSelected = selectedValues.includes(optionValue);
      if (isSelected) {
        newValue = selectedValues.filter(v => v !== optionValue);
      } else {
        newValue = [...selectedValues, optionValue];
      }
    } else {
      newValue = optionValue;
      setIsOpen(false);
    }

    if (onChange) {
      onChange(newValue);
    }
  }, [multiple, selectedValues, onChange]);

  // 处理清除
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = multiple ? [] : undefined;
    if (onChange) {
      onChange(newValue as any);
    }
  }, [multiple, onChange]);

  // 处理点击展开/收起
  const handleToggle = useCallback(() => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(-1);
        setSearchValue('');
      }
    }
  }, [disabled, loading, isOpen]);

  // 键盘事件处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled || loading) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (isOpen && focusedIndex >= 0) {
          const option = filteredOptions[focusedIndex];
          if (option && !option.props.disabled) {
            e.preventDefault();
            handleSelect(option.props.value);
          }
        } else {
          handleToggle();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
        } else {
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
    }
  }, [disabled, loading, isOpen, focusedIndex, filteredOptions, handleSelect, handleToggle]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 打开时聚焦搜索框
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  // 尺寸类名
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-3 py-2.5 text-lg'
  };

  const arrowIconClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const canClear = clearable && !disabled && !loading && selectedValues.length > 0;

  return (
    <div ref={selectRef} className={`relative ${className}`} {...props}>
      {/* 选择框 */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative flex items-center cursor-pointer rounded-md border bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:border-blue-500 [-webkit-app-region:no-drag]
          ${isOpen ? 'ring-2 ring-blue-500 ring-offset-2 border-blue-500' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : ''}
          ${sizeClasses[size]}
        `}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          <span className={`block truncate ${selectedValues.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
            {getSelectedLabels()}
          </span>
        </div>

        {/* 操作图标 */}
        <div className="flex items-center space-x-1 ml-2">
          {loading && (
            <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-4 h-4" />
          )}
          {canClear && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className={arrowIconClasses[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`
              text-gray-400 transition-transform duration-200
              ${isOpen ? 'rotate-180' : 'rotate-0'}
              ${arrowIconClasses[size]}
            `}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {/* 搜索框 */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <Input
                ref={searchInputRef}
                placeholder="搜索选项..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setFocusedIndex(-1);
                }}
                onClick={(e) => e.stopPropagation()}
                size={size}
                fullWidth
                className="mb-0"
              />
            </div>
          )}

          {/* 选项列表 */}
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.props.value);
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={option.props.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`
                      px-3 py-2 cursor-pointer select-none
                      ${option.props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                      ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                      ${isFocused ? 'bg-blue-100' : ''}
                    `}
                    onClick={() => {
                      if (!option.props.disabled) {
                        handleSelect(option.props.value);
                      }
                    }}
                  >
                    {multiple && (
                      <span className="inline-block mr-2 w-4 h-4">
                        {isSelected && (
                          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                          </svg>
                        )}
                      </span>
                    )}
                    {option.props.children || option.props.label}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              {searchable && searchValue ? '无匹配选项' : '无选项'}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
export { SelectOption };
