import React, { useState, useRef } from 'react';
import CustomInput, { CustomInputProps } from './CustomInput';

export interface SearchInputProps extends Omit<CustomInputProps, 'leftIcon' | 'rightIcon'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  loading?: boolean;
  searchDelay?: number; // 搜索防抖延迟，毫秒
  showClearButton?: boolean;
}

/**
 * SearchInput 组件 - 高级搜索输入框
 *
 * 特性:
 * - 内置搜索图标
 * - 可选清除按钮
 * - 搜索防抖功能
 * - 加载状态指示
 * - Enter键快速搜索
 * - 空值时隐藏清除按钮
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  onChange,
  onSearch,
  onClear,
  loading = false,
  searchDelay = 300,
  showClearButton = true,
  placeholder = '搜索...',
  disabled,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = onChange ? value : internalValue;

  // 防抖搜索
  const debouncedSearch = (searchValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onSearch?.(searchValue);
    }, searchDelay);
  };

  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);

    if (newValue.trim()) {
      debouncedSearch(newValue);
    } else {
      onSearch?.(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(currentValue);
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleClear = () => {
    const newValue = '';
    setInternalValue(newValue);
    onChange?.(newValue);
    inputRef.current?.focus();

    // 清除待执行的搜索
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    onClear?.();
  };

  const handleSearch = () => {
    onSearch?.(currentValue);
    inputRef.current?.focus();
  };

  // 搜索图标
  const searchIcon = (
    <button
      type="button"
      onClick={handleSearch}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center w-5 h-5 text-gray-400
        hover:text-gray-600 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
      `}
      aria-label="搜索"
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}
    </button>
  );

  // 清除图标
  const clearIcon = showClearButton && loading !== true && currentValue ? (
    <button
      type="button"
      onClick={handleClear}
      disabled={disabled}
      className={`
        flex items-center justify-center w-5 h-5 text-gray-400
        hover:text-gray-600 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
      `}
      aria-label="清除搜索"
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  ) : null;

  return (
    <div className="search-input-wrapper">
      <CustomInput
        ref={inputRef}
        leftIcon={searchIcon}
        rightIcon={clearIcon}
        value={currentValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        variant="outlined"
        {...rest}
      />
    </div>
  );
};

SearchInput.displayName = 'SearchInput';

export default SearchInput;
