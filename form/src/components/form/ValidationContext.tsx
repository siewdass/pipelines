import { createContext, useContext } from 'react';

interface ValidationContextType {
  showValidation: boolean;
  customErrors: Record<string, string>;
}

export const ValidationContext = createContext<ValidationContextType>({
  showValidation: false,
  customErrors: {},
});

export const useValidation = () => useContext(ValidationContext);
