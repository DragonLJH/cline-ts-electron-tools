import React, { forwardRef, useState, useCallback } from 'react';
import Checkbox, { CheckboxSize } from './Checkbox';

export type CheckboxGroupOrientation = 'horizontal' | 'vertical';

export interface CheckboxGroupProps {
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  disabled?: boolean;
  size?: CheckboxSize;
  orientation?: CheckboxGroupOrientation;
  onChange?: (value: (string | number)[]) => void;
  children: React.ReactNode;
  className?: string;
  max?: number; // 最大选择数量
  min?: number; // 最小选择数量
}

export interface CheckboxGroupItemProps {
  value: string | number;
  disabled?: boolean;
  children?: React.ReactNode;
}

const CheckboxGroupItem: React.FC<CheckboxGroupItemProps> = ({ value, disabled, children }) => {
  // 这个组件只用于传递选项信息，实际渲染由 CheckboxGroup 控制
  return null;
};

const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(({
  value: controlledValue,
  defaultValue = [],
  disabled = false,
  size = 'medium',
  orientation = 'vertical',
  onChange,
  children,
  className = '',
  max,
  min = 0,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState<(string | number)[]>(defaultValue);

  // 是否受控组件
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleCheckboxChange = useCallback((checked: boolean, value?: string | number) => {
    if (value === undefined) return;

    let newValue: (string | number)[];

    if (isControlled) {
      newValue = checked
        ? [...currentValue, value]
        : currentValue.filter(v => v !== value);
    } else {
      newValue = checked
        ? [...internalValue, value]
        : internalValue.filter(v => v !== value);
    }

    // 检查最大/最小选择数量限制
    if (max !== undefined && newValue.length > max) return;
    if (checked && min !== undefined && currentValue.length < min) return;

    if (!isControlled && checked) {
      setInternalValue(newValue);
    } else if (!isControlled && !checked) {
      setInternalValue(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }
  }, [isControlled, currentValue, internalValue, max, min, onChange]);

  // 从 children 中提取 Checkbox 选项
  const checkboxOptions = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<CheckboxGroupItemProps> =>
      React.isValidElement(child) && child.type === CheckboxGroupItem
  );

  return (
    <div
      ref={ref}
      role="group"
      className={`
        ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}
        ${className}
      `}
      {...props}
    >
      {checkboxOptions.map((option, index) => (
        <Checkbox
          key={option.props.value.toString()}
          value={option.props.value}
          checked={currentValue.includes(option.props.value)}
          disabled={disabled || option.props.disabled}
          size={size}
          onChange={handleCheckboxChange}
        >
          {option.props.children}
        </Checkbox>
      ))}
    </div>
  );
});

CheckboxGroup.displayName = 'CheckboxGroup';

export default CheckboxGroup;
export { CheckboxGroupItem };
