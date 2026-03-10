import { useState, useRef, useEffect } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './index.css';
import { Base } from './base';
import { NumberInput } from './number';

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
      {/* Hours */}
      <div className="time-field">
        <NumberInput
          value={hours12}
          onChange={(val) => handleTimeChange('h', val)}
          onIncrement={() => handleTimeChange('h', (hours12 === 12 ? 1 : hours12 + 1).toString())}
          onDecrement={() => handleTimeChange('h', (hours12 === 1 ? 12 : hours12 - 1).toString())}
          style={{ width: '90px' }}
        />
        <span>HORA</span>
      </div>

      <div className="time-separator" style={{ marginTop: '0' }}>:</div>

      {/* Minutes */}
      <div className="time-field">
        <NumberInput
          value={minutes}
          onChange={(val) => handleTimeChange('m', val)}
          onIncrement={() => {
            const next = (parseInt(minutes, 10) + 1) % 60;
            handleTimeChange('m', next.toString());
          }}
          onDecrement={() => {
            const next = (parseInt(minutes, 10) + 59) % 60;
            handleTimeChange('m', next.toString());
          }}
          style={{ width: '90px' }}
        />
        <span>MIN</span>
      </div>

      {/* Period */}
      <div className="time-field">
        <div 
          className="datepicker-wrapper" 
          style={{ width: '60px', cursor: 'pointer' }}
          onClick={() => handleTimeChange('p', period === 'AM' ? 'PM' : 'AM')}
        >
          <div className="datepicker-input period-input" style={{ textAlign: 'left', paddingRight: '0', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            {period}
          </div>
        </div>
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<DatePicker>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (containerRef.current && 
          !containerRef.current.contains(target) && 
          !target.closest('.react-datepicker-popper')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // If not isTime, auto-close on selection (standard behavior)
    if (!isTime) setIsOpen(false);
  };

  const dateFormat = isTime ? 'hh:mm a' : isDateTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
  const placeholder = '';

  return (
    <Base label={label} errors={errors} hasValue={!!selected}>
      <div className="datepicker-wrapper" ref={containerRef}>
        <DatePicker
          ref={pickerRef}
          selected={selected}
          onChange={onChange}
          open={isOpen}
          onFocus={() => setIsOpen(true)}
          onInputClick={() => setIsOpen(true)}
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
          <div className="dropdown-indicator" onClick={() => setIsOpen(!isOpen)}>
            <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </Base>
  );
});
