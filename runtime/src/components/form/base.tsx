import type { ReactNode } from 'react';

interface BaseProps {
  label?: string;
  errors?: string;
  path?: string;
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

import { useValidation } from './Form';

export function Base({ label, errors, path, hasValue, children }: BaseProps) {
  const { showValidation, customErrors } = useValidation();
  
  let finalError = errors;
  if (path && customErrors[path]) {
    finalError = customErrors[path];
  }

  // Only show error if globally asked to show (on submit) or if the field was already interacted with (hasValue)
  const displayError = (finalError && (showValidation || hasValue)) ? formatError(finalError) : undefined;
  
  return (
    <div className={`relative mb-4 text-left group w-full ${hasValue ? 'has-value' : ''} ${displayError ? 'has-error' : ''}`}>
      <div className="flex items-center w-full min-h-[44px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg transition-all hover:border-gray-300 dark:hover:border-gray-700 focus-within:ring-[3px] focus-within:ring-brand-500/10 focus-within:border-brand-500">
        {children}
      </div>
      
      {label && (
        <label className={`absolute left-2 transition-all duration-200 pointer-events-none px-1
          ${hasValue 
            ? 'top-0 -translate-y-1/2 text-[10px] bg-white dark:bg-gray-900 text-brand-500' 
            : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'}
          group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-[10px] group-focus-within:bg-white dark:group-focus-within:bg-gray-900 group-focus-within:text-brand-500`}>
          {label}
        </label>
      )}
      
      {displayError && (
        <div className="absolute -bottom-1.5 right-2 text-[10px] text-error-500 bg-white dark:bg-gray-900 px-1 pointer-events-none z-1">
          {displayError}
        </div>
      )}
    </div>
  );
}
