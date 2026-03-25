import * as React from 'react';
import { useMemo } from 'react';
import { JsonForms } from '@jsonforms/react';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { renderers } from './index';

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


export interface FormValues extends Record<string, any> {
  [key: string]: any;
}

interface SchemaItem {
  type: string;
  name?: string;
  label?: string;
  items?: (SchemaItem | string)[];
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  onValidate?: (values: FormValues) => boolean;
}

export interface FormProps<T> {
  schema: SchemaItem;
  data: T;
  onChange: (data: T, isValid: boolean) => void;
  showValidation?: boolean;
  className?: string;
}

export const BaseForm = <T extends Record<string, unknown>>({
  schema,
  data,
  onChange,
  showValidation = false,
  className = "",
}: FormProps<T>) => {

  const { jsonSchema, uiSchema } = useMemo(() => {
    const properties: { [property: string]: JsonSchema } = {};
    const required: string[] = [];

    const buildUiSchema = (itemRaw: SchemaItem | any): UISchemaElement | null => {
      // Normalize item to support both full names and short aliases
      const item: SchemaItem = {
        type: itemRaw.type || itemRaw.t,
        name: itemRaw.name || itemRaw.n,
        label: itemRaw.label || itemRaw.l,
        items: itemRaw.items || itemRaw.i,
        required: itemRaw.required || itemRaw.r,
        pattern: itemRaw.pattern || itemRaw.p,
        min: itemRaw.min,
        max: itemRaw.max,
        onValidate: itemRaw.onValidate || itemRaw.o,
      };

      const type = item.type;

      // Layouts
      if (type === 'vertical' || type === 'v' || type === 'horizontal' || type === 'h') {
        const layoutType = (type === 'vertical' || type === 'v') ? 'VerticalLayout' : 'HorizontalLayout';
        return {
          type: layoutType,
          elements: (item.items as SchemaItem[] || [])
            .map(buildUiSchema)
            .filter((e): e is UISchemaElement => e !== null),
        };
      }

      // Controls
      if (item.name) {
        // Build JSON Schema Part
        const jsonField: any = {};
       
        switch (type) {
          case 't':
          case 'text':
          case 'e':
          case 'email':
          case 'p':
          case 'password':
            jsonField.type = 'string';
            if (item.min) jsonField.minLength = item.min;
            else if (item.required) jsonField.minLength = 1;
            if (item.max) jsonField.maxLength = item.max;
            if (type === 'e' || type === 'email') jsonField.format = 'email';
            if (type === 'p' || type === 'password') jsonField.format = 'password';
            break;

          case 's':
          case 'select':
            jsonField.type = 'string';
            if (item.items) jsonField.enum = item.items;
            break;

          case 'm':
          case 'multiselect':
            jsonField.type = 'array';
            jsonField.uniqueItems = true;
            if (item.required) jsonField.minItems = 1;
            if (item.items) jsonField.items = { type: 'string', enum: item.items };
            break;
            
          case 'n':
          case 'number':
            jsonField.type = 'number';
            if (item.min !== undefined) jsonField.minimum = item.min;
            if (item.max !== undefined) jsonField.maximum = item.max;
            break;
    
          case 'b':
          case 'boolean':
            jsonField.type = 'boolean';
            break;
            
          case 'd':
          case 'date':
            jsonField.type = 'string';
            jsonField.format = 'date';
            break;

          case 'c':
          case 'time':
            jsonField.type = 'string';
            jsonField.format = 'time';
            break;
        } 

        properties[item.name] = jsonField as JsonSchema;
        if (item.required) {
          required.push(item.name);
        }

        return {
          type: 'Control',
          scope: `#/properties/${item.name}`,
          label: item.label,
        };
      }

      return null;
    };

    const ui = buildUiSchema(schema) || { type: 'VerticalLayout', elements: [] };
    const json: JsonSchema = {
      type: 'object',
      properties: properties as any,
      required: required.length > 0 ? required : undefined,
    };

    return { jsonSchema: json, uiSchema: ui };
  }, [schema]);

  const validators = useMemo(() => {
    const map: Record<string, (values: FormValues) => boolean> = {};
    const traverse = (itemRaw: SchemaItem | any) => {
      // Normalize for validators too
      const item = {
        name: itemRaw.name || itemRaw.n,
        onValidate: itemRaw.onValidate || itemRaw.o,
        items: itemRaw.items || itemRaw.i
      };

      if (item.name && item.onValidate) {
        map[item.name] = item.onValidate;
      }
      if (item.items) {
        item.items.forEach((child: any) => {
          if (typeof child !== 'string') traverse(child);
        });
      }
    };
    traverse(schema);
    return map;
  }, [schema]);

  const customErrors = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(validators).forEach(([name, validate]) => {
      // Validate using the current data prop
      if (!validate(data)) {
        map[name] = 'Invalid';
      }
    });
    return map;
  }, [validators, data]);

  const handleJsonFormsChange = ({ data: newData, errors: ajvErrors }: { data: any, errors?: any[] }) => {
    // Determine custom validity for the NEW data to pass correct isValid to parent
    let customValid = true;
    Object.values(validators).forEach((validate) => {
      if (!validate(newData)) {
        customValid = false;
      }
    });

    onChange(newData, (ajvErrors?.length === 0) && customValid);
  };

  return (
    <div className={className}>
      <ValidationContext.Provider value={{ showValidation, customErrors }}>
        <JsonForms
          schema={jsonSchema}
          uischema={uiSchema}
          data={data}
          renderers={renderers}
          onChange={handleJsonFormsChange}
        />
      </ValidationContext.Provider>
    </div>
  );
};
