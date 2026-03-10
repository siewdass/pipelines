import { withJsonFormsControlProps } from '@jsonforms/react';
import { Base } from './base';

export const CheckRenderer = withJsonFormsControlProps(
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
        <div className="datepicker-wrapper" onClick={cycleState} style={{ cursor: 'pointer' }}>
          <div
            className="datepicker-input"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              userSelect: 'none',
              paddingRight: '0', // Indicators handle padding
            }}
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
          </div>
          <div className="datepicker-indicators">
            {!isNull && (
              <>
                <span className="indicator-separator" />
                <div className="check-indicator">
                  <svg width="19" viewBox="0 0 20 20" focusable="false" style={{ 
                    display: 'block',
                    visibility: isNull ? 'hidden' : 'visible',
                  }}>
                    {isTrue ? (
                      <path 
                        d="M3.5 10.548c0.436-0.446 1.043-0.481 1.576 0l2.908 2.747 6.908-6.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-7.695 7.502-7.695 7.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-3.287-3.084-3.695-3.502s-0.436-1.17 0-1.615z" 
                        fill="#646cff" 
                      />
                    ) : (
                      <path 
                        d="M10 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-14c-3.314 0-6 2.686-6 6 0 1.179.34 2.277.925 3.204l8.279-8.279c-.927-.585-2.025-.925-3.204-.925zm4.925 3.204l-8.279 8.279c.927.585 2.025.925 3.204.925 3.314 0 6-2.686 6-6 0-1.179-.34-2.277-.925-3.204z" 
                        fill="#646cff"
                        transform="translate(10, 10) scale(0.85) translate(-10, -10)"
                      />
                    )}
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>
      </Base>
    );
  }
);
