import React, { forwardRef, useState, useCallback } from 'react';
import Radio, { RadioSize } from './Radio';

export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface RadioGroupProps {
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  size?: RadioSize;
  orientation?: RadioGroupOrientation;
  onChange?: (value: string | number) => void;
  children: React.ReactNode;
  className?: string;
  name?: string;
}

export interface RadioGroupItemProps {
  value: string | number;
  disabled?: boolean;
  children?: React.ReactNode;
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, disabled, children }) => {
  // 这个组件只用于传递选项信息，实际渲染由 RadioGroup 控制
  return null;
};

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(({
  value: controlledValue,
  defaultValue,
  disabled = false,
  size = 'medium',
  orientation = 'vertical',
  onChange,
  children,
  className = '',
  name,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue || '');

  // 是否受控组件
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleRadioChange = useCallback((value: string | number | undefined) => {
    if (value !== undefined) {
      if (!isControlled) {
        setInternalValue(value);
      }
      if (onChange) {
        onChange(value);
      }
    }
  }, [isControlled, onChange]);

  // 从 children 中提取 Radio 选项
  const radioOptions = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<RadioGroupItemProps> =>
      React.isValidElement(child) && child.type === RadioGroupItem
  );

  return (
    <div
      ref={ref}
      role="radiogroup"
      className={`
        ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}
        ${className}
      `}
      {...props}
    >
      {radioOptions.map((option, index) => (
        <Radio
          key={option.props.value.toString()}
          name={name}
          value={option.props.value}
          checked={currentValue === option.props.value}
          disabled={disabled || option.props.disabled}
          size={size}
          onChange={handleRadioChange}
        >
          {option.props.children}
        </Radio>
      ))}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
export { RadioGroupItem };
