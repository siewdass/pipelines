import { useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { renderers } from './components';

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
    },
    email: {
      type: 'string',
      format: 'email',
    },
    age: {
      type: 'integer',
      minimum: 18,
    },
    active: {
      type: 'boolean',
    },
    birthdate: {
      type: 'string',
      format: 'date',
    },
    meetingTime: {
      type: 'string',
      format: 'time',
    },
    country: {
      type: 'string',
      enum: [
        'Argentina',
        'Brasil',
        'Chile',
        'Colombia',
        'Ecuador',
        'México',
        'Perú',
        'Venezuela',
      ],
    },
    skills: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
        enum: [
          'JavaScript',
          'TypeScript',
          'React',
          'Node.js',
          'Python',
          'SQL',
          'Docker',
          'AWS',
        ],
      },
    },
  },
  required: ['name', 'country', 'skills'],
};

const uischema = {
  type: 'Group',
  label: 'Formulario',
  elements: [
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/name',
          label: 'Nombre',
        },
        {
          type: 'Control',
          scope: '#/properties/email',
          label: 'Correo Electrónico',
        },
        {
          type: 'Control',
          scope: '#/properties/age',
          label: 'Edad',
        },
        {
          type: 'Control',
          scope: '#/properties/active',
          label: 'Activo',
        },
      ],
    },
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/birthdate',
          label: 'Fecha de Nacimiento',
        },
        {
          type: 'Control',
          scope: '#/properties/meetingTime',
          label: 'Hora de Reunión',
        },
      ],
    },
    {
      type: 'Control',
      scope: '#/properties/country',
      label: 'País',
    },
    {
      type: 'Control',
      scope: '#/properties/skills',
      label: 'Habilidades',
    },
  ],
};

export function Home() {
  const [data, setData] = useState<Record<string, any>>({ name: '' });
  const [showErrors, setShowErrors] = useState(false);

  const handleSubmit = () => {
    setShowErrors(true);
    console.log(data);
  };

  return (
    <div style={{ maxWidth: 1024}}>
      <h1 style={{ textAlign: 'center' }}>JSON Forms With Custom Render</h1>
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={renderers}
        onChange={({ data }) => setData(data)}
        validationMode={showErrors ? 'ValidateAndShow' : 'ValidateAndHide'}
      />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={handleSubmit} className="submit-button">
          Validar y Enviar
        </button>
      </div>
    </div>
  );
}