import { useMemo, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { renderers } from './index';
import Button from '../ui/button/Button';
import { ValidationContext } from './ValidationContext';

interface SchemaItem {
  type: string;
  name?: string;
  label?: string;
  items?: (SchemaItem | string)[];
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

interface FormProps {
  schema: SchemaItem;
  initial?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  className?: string;
  submitLabel?: string;
}

export const Form = ({ schema, initial = {}, onSubmit, className, submitLabel = "Guardar" }: FormProps) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(initial);
  // Start as invalid if it's a new form, or we'll let JsonForms tell us on first render
  const [isValid, setIsValid] = useState(false);

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

  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    if (isValid) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <ValidationContext.Provider value={{ showValidation }}>
        <JsonForms
          schema={jsonSchema}
          uischema={uiSchema}
          data={formData}
          renderers={renderers}
          onChange={({ data, errors }) => {
            setFormData(data);
            setIsValid(errors?.length === 0);
          }}
        />
      </ValidationContext.Provider>
      <div className="mt-6">
        <Button 
          type="submit" 
          size="sm" 
          className={`w-full sm:w-auto transition-all ${showValidation && !isValid ? 'animate-shake border-error-500 text-error-500' : ''}`}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
