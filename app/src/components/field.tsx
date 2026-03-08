import { withJsonFormsControlProps } from '@jsonforms/react';
import { Base } from './base';

export const FieldRenderer = withJsonFormsControlProps(
  ({ data, handleChange, path, label, errors, schema }) => {
    let inputType = 'text';
    if (schema.type === 'number' || schema.type === 'integer') {
      inputType = 'number';
    } else if (schema.format === 'email') {
      inputType = 'email';
    } else if (schema.format === 'password') {
      inputType = 'password';
    }

    const step = schema.type === 'number' ? 'any' : schema.type === 'integer' ? '1' : undefined;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '') {
        handleChange(path, undefined);
        return;
      }
      
      if (schema.type === 'number' || schema.type === 'integer') {
        const num = Number(val);
        handleChange(path, isNaN(num) ? val : num);
      } else {
        handleChange(path, val);
      }
    };

    return (
      <Base label={label} errors={errors} hasValue={data !== undefined && data !== null && data !== ''}>
        <input
          type={inputType}
          step={step}
          value={data ?? ''}
          onChange={onChange}
          placeholder=""
          className="datepicker-input"
        />
      </Base>
    );
  }
);
