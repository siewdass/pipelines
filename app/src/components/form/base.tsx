import type { ReactNode } from 'react';

interface BaseProps {
  label?: string;
  errors?: string;
  hasValue?: boolean;
  children: ReactNode;
}

const formatError = (err: string) => {
  if (err.includes('is a required property')) return 'Requerido';
  if (err.includes('must match format "email"')) return 'Email inválido';
  if (err.includes('must match format "date"')) return 'Fecha inválida';
  if (err.includes('must match format "time"')) return 'Hora inválida';
  if (err.includes('must be >=')) return `Mínimo ${err.split('>= ')[1]}`;
  if (err.includes('must be <=')) return `Máximo ${err.split('<= ')[1]}`;
  if (err.includes('must NOT have fewer than')) return `Mínimo ${err.match(/\d+/)?.[0]} caracteres`;
  if (err.includes('must NOT have more than')) return `Máximo ${err.match(/\d+/)?.[0]} caracteres`;
  return err; // Fallback
};

export function Base({ label, errors, hasValue, children }: BaseProps) {
  const displayError = errors ? formatError(errors) : undefined;
  
  return (
    <div className={`control ${hasValue ? 'has-value' : ''} ${displayError ? 'has-error' : ''}`} style={{ marginBottom: '1rem', textAlign: 'left', position: 'relative' }}>
      {children}
      {label && <label className="floating-label">{label}</label>}
      {displayError && <div className="floating-error">{displayError}</div>}
    </div>
  );
}
