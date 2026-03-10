import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Form } from "../../components/form";
import ComponentCard from "../../components/common/ComponentCard";

const SCHEMA = {
  type: 'vertical',
  items: [
    {
      type: 'horizontal',
      items: [
        { type: 'string', name: 'name', label: 'Nombre', min: 3, max: 100, required: true },
        { type: 'string', name: 'email', label: 'Correo Electrónico', pattern: 'email' },
        { type: 'number', name: 'age', label: 'Edad', min: 18 },
        { type: 'boolean', name: 'active', label: 'Activo' }
      ],
    },
    {
      type: 'horizontal',
      items: [
        { type: 'datetime', name: 'birthdate', label: 'Fecha de Nacimiento', pattern: 'yyyy-MM-dd' },
        { type: 'datetime', name: 'meetingTime', label: 'Hora de Reunión', pattern: 'HH:mm' },
      ],
    },
    { type: 'string', name: 'country', label: 'País', required: true, items: [ 'Argentina', 'Brasil', 'Chile', 'Colombia' ] },// falta select
    { type: 'array', name: 'skills', label: 'Habilidades', required: true, items: [ 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python' ] }
  ]
}

export default function FormElements() {
  const initial = { 
    name: "John Doe",
    country: "Argentina"
  };

  const handleSubmit = (formData: Record<string, unknown>) => {
    console.log("Form Submitted:", formData);
  };

  return (
    <div>
      <PageMeta
        title="React.js Form Elements | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements page using the dynamic Form component"
      />
      <PageBreadcrumb pageTitle="Form Elements" />
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard title="Dynamic Form Generation">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
            <Form 
              schema={SCHEMA}
              initial={initial}
              onSubmit={handleSubmit}
            />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
