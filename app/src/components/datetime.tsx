import { useState } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './index.css';
import { Base } from './base';

export const DateTimeRenderer = withJsonFormsControlProps(({ data, handleChange, path, label, errors, schema: controlSchema }) => {
  const format = (controlSchema as any)?.format as string;
  const isTime = format === 'time';
  const isDateTime = format === 'date-time';

  const [selected, setSelected] = useState<Date | null>(
    data ? new Date(isTime ? `1970-01-01T${data}` : data) : null
  );

  const onChange = (date: Date | null) => {
    setSelected(date);
    if (!date) return handleChange(path, undefined);

    if (isTime) {
      handleChange(path, date.toTimeString().slice(0, 8)); // "HH:mm:ss"
    } else if (isDateTime) {
      handleChange(path, date.toISOString()); // "YYYY-MM-DDTHH:mm:ss.sssZ"
    } else {
      handleChange(path, date.toISOString().split('T')[0]); // "YYYY-MM-DD"
    }
  };

  const dateFormat = isTime ? 'HH:mm' : isDateTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
  const placeholder = '';

  return (
    <Base label={label} errors={errors} hasValue={!!selected}>
      <div className="datepicker-wrapper">
        <DatePicker
          selected={selected}
          onChange={onChange}
          dateFormat={dateFormat}
          placeholderText={placeholder}
          className="datepicker-input"
          showTimeSelect={isTime || isDateTime}
          showTimeSelectOnly={isTime}
          timeFormat="HH:mm"
          timeIntervals={15}
        />
        {selected && (
          <button
            type="button"
            className="datepicker-clear"
            onClick={() => onChange(null)}
            aria-label="Limpiar"
          >
            <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
    </Base>
  );
});
