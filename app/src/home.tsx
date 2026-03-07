import { useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, isStringControl } from '@jsonforms/core';
import { vanillaRenderers, vanillaCells } from '@jsonforms/vanilla-renderers';

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
    },
  },
  required: ['name'],
};

const uischema = {
  type: 'Group',
  label: 'Formulario',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/name',
      label: 'Nombre',
    },
  ],
};

const CustomInputRenderer = withJsonFormsControlProps(({ data, handleChange, path, label, errors }) => (
  <div className="control">
    <label className="label">{label}</label>
    <input
      type="text"
      value={data || ''}
      onChange={(e) => handleChange(path, e.target.value)}
      placeholder="Ingresa tu texto aquí"
      className="input"
    />
    {errors && <div className="error">{errors}</div>}
  </div>
));

const customTester = rankWith(3, isStringControl);

const renderers = [
  ...vanillaRenderers,
  { tester: customTester, renderer: CustomInputRenderer },
];

export function Home() {
  const [data, setData] = useState({ name: '' });
  const [showErrors, setShowErrors] = useState(false);

  const handleSubmit = () => {
    setShowErrors(true);
    console.log('Datos enviados:', data);
  };

  return (
    <div>
      <h1>JSON Forms Example</h1>
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={renderers}
        cells={vanillaCells}
        onChange={({ data }) => setData(data)}
        validationMode={showErrors ? 'ValidateAndShow' : 'ValidateAndHide'}
      />
      <button onClick={handleSubmit} className="submit-button">
        Validar y Enviar
      </button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}