import { useState, useCallback, ReactElement, useMemo, useRef } from "react";
import { BaseForm, FormValues } from "../components/form/Form";

export type SubmitCallback<T> = (data: T) => void;

export interface BoundFormProps<T> {
  initial?: T;
  className?: string;
}

export function useForm<T extends FormValues = FormValues>(schema: any): [
  (callback: SubmitCallback<T>) => void,
  (props: BoundFormProps<T>) => ReactElement | null
] {
  const [data, setData] = useState<T>({} as T);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [showValidation, setShowValidation] = useState<boolean>(false);

  const onSubmit = useCallback(
    (callback: SubmitCallback<T>) => {
      setShowValidation(true);
      if (isValid) {
        callback(data);
      }
    },
    [isValid, data]
  );

  const handleChange = useCallback((newData: T, newIsValid: boolean) => {
    setData(newData);
    setIsValid(newIsValid);
  }, []);

  // Use a ref to keep the latest state accessible to the stable component.
  // CRITICAL: We update this synchronously during render so that BoundFormComponent
  // always has access to the *current* render's data, avoiding the "one render delay"
  // that causes inputs to erase/overwrite characters.
  const stateRef = useRef({ data, showValidation, handleChange });
  // eslint-disable-next-line
  stateRef.current = { data, showValidation, handleChange };

  // Create a stable component identity that only changes if the schema changes
  const BoundFormComponent = useMemo(() => {
    return ({ className = "" }: BoundFormProps<T>) => {
      // Grabbing values from ref during render to avoid stale closures 
      // while keeping the component identity stable.
      const { 
        data: currentData, 
        showValidation: currentShowValidation, 
        handleChange: currentHandleChange 
      } = stateRef.current;

      return (
        <BaseForm<T>
          schema={schema}
          data={currentData}
          onChange={currentHandleChange}
          showValidation={currentShowValidation}
          className={className}
        />
      );
    };
  }, [schema]);

  return [onSubmit, BoundFormComponent];
}
