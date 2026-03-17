import { useMemo } from 'react';
import { JsonForms } from '@jsonforms/react';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { renderers } from './index';
import { ValidationContext } from './ValidationContext';

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

    const buildUiSchema = (item: SchemaItem): UISchemaElement | null => {
      // Layouts
      if (item.type === 'vertical' || item.type === 'horizontal') {
        return {
          type: item.type === 'vertical' ? 'VerticalLayout' : 'HorizontalLayout',
          elements: (item.items as SchemaItem[] || [])
            .map(buildUiSchema)
            .filter((e): e is UISchemaElement => e !== null),
        };
      }

      // Controls
      if (item.name) {
        // Build JSON Schema Part
        const jsonField: any = {};
        
        switch (item.type) {
          case 'string':
            jsonField.type = 'string';
            if (item.min) jsonField.minLength = item.min;
            else if (item.required) jsonField.minLength = 1; // Ensure not empty if required
            
            if (item.max) jsonField.maxLength = item.max;
            if (item.pattern === 'email') jsonField.format = 'email';
            if (item.pattern === 'password') jsonField.format = 'password';
            if (item.items) jsonField.enum = item.items;
            break;
          case 'number':
            jsonField.type = 'number';
            if (item.min !== undefined) jsonField.minimum = item.min;
            if (item.max !== undefined) jsonField.maximum = item.max;
            break;
          case 'boolean':
            jsonField.type = 'boolean';
            break;
          case 'datetime':
            jsonField.type = 'string';
            jsonField.format = item.pattern?.includes('HH:mm') ? 'time' : 'date';
            break;
          case 'array':
            jsonField.type = 'array';
            jsonField.uniqueItems = true;
            if (item.required) jsonField.minItems = 1; // Ensure not empty if required
            if (item.items) {
              jsonField.items = {
                type: 'string',
                enum: item.items,
              };
            }
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
    const traverse = (item: SchemaItem) => {
      if (item.name && item.onValidate) {
        map[item.name] = item.onValidate;
      }
      if (item.items) {
        item.items.forEach(child => {
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
