import { useState, useRef } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './index.css';
import { Base } from './base';

const CustomTimeInput = ({ date, onChange }: { date?: Date | null, onChange?: (time: string) => void }) => {
  const safeDate = date || new Date();
  const currentHours = safeDate.getHours();
  const hours12 = currentHours % 12 || 12;
  const minutes = safeDate.getMinutes().toString().padStart(2, '0');
  const period = currentHours >= 12 ? 'PM' : 'AM';

  const handleTimeChange = (type: 'h' | 'm' | 'p', value: string) => {
    if (!onChange) return;
    let newH = safeDate.getHours();
    let newM = safeDate.getMinutes();

    if (type === 'h') {
      const num = Math.min(12, Math.max(1, parseInt(value, 10) || 1));
      const isPM = newH >= 12;
      newH = isPM ? (num % 12) + 12 : num % 12;
    } else if (type === 'm') {
      newM = Math.min(59, Math.max(0, parseInt(value, 10) || 0));
    } else if (type === 'p') {
      const isPM = value === 'PM';
      const h12 = newH % 12;
      newH = isPM ? h12 + 12 : h12;
    }

    const timeString = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    onChange(timeString);
  };

  return (
    <div className="custom-time-input">
      <div className="time-field">
        <input 
          type="number" 
          value={hours12} 
          onChange={(e) => handleTimeChange('h', e.target.value)} 
          onFocus={(e) => e.target.select()} 
          onWheel={(e) => {
            e.currentTarget.blur();
            const delta = e.deltaY < 0 ? 1 : -1;
            handleTimeChange('h', (hours12 + delta).toString());
          }}
          min={1} 
          max={12} 
        />
        <span>HORA</span>
      </div>
      <div className="time-separator">:</div>
      <div className="time-field">
        <input 
          type="number" 
          value={minutes} 
          onChange={(e) => handleTimeChange('m', e.target.value)} 
          onFocus={(e) => e.target.select()} 
          onWheel={(e) => {
            e.currentTarget.blur();
            const delta = e.deltaY < 0 ? 1 : -1;
            const next = (parseInt(minutes, 10) + delta + 60) % 60;
            handleTimeChange('m', next.toString());
          }}
          min={0} 
          max={59} 
        />
        <span>MIN</span>
      </div>
      <div className="time-field" style={{ position: 'relative' }}>
        <input 
          type="number" 
          min={0} 
          max={1} 
          value={period === 'AM' ? 0 : 1}
          onChange={(e) => handleTimeChange('p', parseInt(e.target.value, 10) === 0 ? 'AM' : 'PM')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              handleTimeChange('p', period === 'AM' ? 'PM' : 'AM');
            }
          }}
          onWheel={(e) => {
            e.preventDefault();
            handleTimeChange('p', period === 'AM' ? 'PM' : 'AM');
          }}
          className="period-input" 
          style={{ 
            color: 'transparent', 
            caretColor: 'transparent', 
            cursor: 'pointer',
            paddingLeft: '0px',
            height: '32px',
            width: '55px'
          }}
        />
        <span style={{ 
          position: 'absolute', 
          top: '35%', 
          left: '50%', 
          transform: 'translate(-100%, -50%)', 
          pointerEvents: 'none',
          fontSize: '14px',
          color: '#fff',
          fontWeight: 500
        }}>{period}</span>
        <span>AM/PM</span>
      </div>
    </div>
  );
};

export const DateTimeRenderer = withJsonFormsControlProps(({ data, handleChange, path, label, errors, schema: controlSchema }) => {
  const format = (controlSchema as any)?.format as string;
  const isTime = format === 'time';
  const isDateTime = format === 'date-time';

  const [selected, setSelected] = useState<Date | null>(
    data ? new Date(isTime ? `1970-01-01T${data}` : data) : null
  );
  const pickerRef = useRef<DatePicker>(null);

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

  const dateFormat = isTime ? 'hh:mm a' : isDateTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
  const placeholder = '';

  return (
    <Base label={label} errors={errors} hasValue={!!selected}>
      <div className="datepicker-wrapper">
        <DatePicker
          ref={pickerRef}
          selected={selected}
          onChange={onChange}
          dateFormat={dateFormat}
          placeholderText={placeholder}
          className="datepicker-input"
          showTimeInput={isTime}
          calendarClassName={isTime ? 'hidden-calendar' : ''}
          customTimeInput={isTime ? (
            <CustomTimeInput 
              date={selected} 
              onChange={(timeString) => {
                const [h, m] = timeString.split(':').map(Number);
                const newDate = new Date(selected || new Date());
                newDate.setHours(h, m, 0, 0);
                onChange(newDate);
              }} 
            />
          ) : undefined}
          showTimeSelect={isDateTime}
          //showMonthDropdown={!isTime}
          //showYearDropdown={!isTime}
          showPopperArrow={false}
          timeFormat="HH:mm"
          timeIntervals={15}
        />
        <div className="datepicker-indicators">
          {selected && (
            <>
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
              <span className="indicator-separator" />
            </>
          )}
          <div className="dropdown-indicator" onClick={() => (pickerRef.current as any)?.setOpen(true)}>
            <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </Base>
  );
});
