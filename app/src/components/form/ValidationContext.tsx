import { createContext, useContext } from 'react';

interface ValidationContextType {
  showValidation: boolean;
}

export const ValidationContext = createContext<ValidationContextType>({
  showValidation: false,
});

export const useValidation = () => useContext(ValidationContext);
