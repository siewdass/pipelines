import { withJsonFormsControlProps } from '@jsonforms/react';
import { Base } from './base';

export const FieldRenderer = withJsonFormsControlProps(
  ({ data, handleChange, path, label, errors, schema }) => {
    let inputType = 'text';
    if (schema.format === 'email') {
      inputType = 'email';
    } else if (schema.format === 'password') {
      inputType = 'password';
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '') {
        handleChange(path, undefined);
        return;
      }
      handleChange(path, val);
    };

    return (
      <Base label={label} errors={errors} hasValue={data !== undefined && data !== null && data !== ''}>
        <div className="datepicker-wrapper">
          <input
            type={inputType}
            value={data ?? ''}
            onChange={onChange}
            placeholder=""
            className="datepicker-input"
            style={{ paddingRight: '12px' }} // Standard fields don't need huge right padding
          />
        </div>
      </Base>
    );
  }
);
