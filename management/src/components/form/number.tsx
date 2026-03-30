import { withJsonFormsControlProps } from '@jsonforms/react';
import { Base } from './base';
import { HiChevronUp, HiChevronDown } from "react-icons/hi2";

interface NumberInputProps {
  value: number | string;
  onChange: (value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  isInteger?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  className?: string;
}

export const NumberInput = ({
  value, 
  onChange, 
  onIncrement, 
  onDecrement, 
  isInteger = true, 
  style, 
  inputStyle,
  className 
}: NumberInputProps) => {
  return (
    <div className={`flex w-full ${className || ''}`} style={style}>
      <input
        type="number"
        step={isInteger ? "1" : "any"}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="w-full px-3 py-2 bg-transparent text-sm text-gray-900 dark:text-white/90 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder=""
        style={inputStyle}
      />
      <div className="flex items-center px-1">
        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1" />
        <div className="flex flex-col justify-center">
          <button type="button" onClick={onIncrement} className="p-0.5 text-gray-400 hover:text-brand-500 transition-colors">
            <HiChevronUp className="w-3 h-3" />
          </button>
          <button type="button" onClick={onDecrement} className="p-0.5 text-gray-400 hover:text-brand-500 transition-colors">
            <HiChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NumberRenderer = withJsonFormsControlProps(
  ({ data, handleChange, path, label, errors, schema }) => {
    const isInteger = schema.type === 'integer';
    
    const handleIncrement = () => {
      const current = typeof data === 'number' ? data : 0;
      handleChange(path, current + 1);
    };

    const handleDecrement = () => {
      const current = typeof data === 'number' ? data : 0;
      const min = (schema as any).minimum ?? (schema as any).min;
      if (min !== undefined && (current - 1) < min) return;
      handleChange(path, current - 1);
    };

    const onChange = (val: string) => {
      if (val === '') {
        handleChange(path, undefined);
        return;
      }
      const num = isInteger ? parseInt(val, 10) : parseFloat(val);
      handleChange(path, isNaN(num) ? val : num);
    };

    return (
      <Base label={label} errors={errors} hasValue={data !== undefined && data !== null && data !== ''}>
        <NumberInput
          value={data}
          onChange={onChange}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          isInteger={isInteger}
        />
      </Base>
    );
  }
);
