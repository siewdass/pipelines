import { withJsonFormsControlProps } from '@jsonforms/react';
import { Base } from './base';

export const TriStateCheckboxRenderer = withJsonFormsControlProps(
  ({ data, handleChange, path, label, errors }) => {

    const isTrue = data === true;
    const isNull = data === undefined || data === null;

    const cycleState = () => {
      if (isNull) handleChange(path, true);
      else if (isTrue) handleChange(path, false);
      else handleChange(path, undefined);
    };

    return (
      <Base label={label} errors={errors} hasValue={!isNull}>
        <div
          className="datepicker-input"
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            userSelect: 'none',
            width: '100%',
          }}
          onClick={cycleState}
        >
          <span style={{
            color: 'inherit', 
            display: 'inline-block', 
            flex: 1,
            textAlign: 'left',
            width: '10px'
          }}>
            {isTrue ? 'Sí' : isNull ? ' ' : 'No'}
          </span>
          <svg 
            height="20" 
            width="20" 
            viewBox="0 0 20 20"
            focusable="false" 
            style={{ 
              display: 'block',
              visibility: isNull ? 'hidden' : 'visible'
            }}
          >
            {isTrue ? (
              <path 
                d="M5.516 10.548c0.436-0.446 1.043-0.481 1.576 0l2.908 2.747 6.908-6.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-7.695 7.502-7.695 7.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-3.287-3.084-3.695-3.502s-0.436-1.17 0-1.615z" 
                fill="#646cff" 
              />
            ) : (
              <path 
                d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" 
                fill="#e74c3c" 
              />
            )}
          </svg>
        </div>
      </Base>
    );
  }
);
