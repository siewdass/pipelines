import { withJsonFormsControlProps } from '@jsonforms/react';
import { Base } from './base';
import { MiniChevronUpIcon, MiniChevronDownIcon } from '../../icons';

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
    <div className={`datepicker-wrapper ${className || ''}`} style={style}>
      <input
        type="number"
        step={isInteger ? "1" : "any"}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="datepicker-input no-spin"
        placeholder=""
        style={inputStyle}
      />
      <div className="datepicker-indicators" style={{ right: '0' }}>
        <span className="indicator-separator" />
        <div className="number-indicators-vertical">
          <button type="button" onClick={onIncrement} className="number-step-btn">
            <MiniChevronUpIcon className="w-3 h-3" />
          </button>
          <button type="button" onClick={onDecrement} className="number-step-btn">
            <MiniChevronDownIcon className="w-3 h-3" />
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
