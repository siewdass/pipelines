import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { useForm } from "../../hooks/useForm";
import Button from "../../components/ui/button/Button";

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

  const [onSubmit, Form] = useForm<Record<string, unknown>>(SCHEMA);

  const handleSave = (formData: any) => {
    console.log("Form perfectly validated and Submitted:", formData);
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
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg space-y-6">
            <Form 
              initial={initial}
            />
            <div className="flex w-full mt-6">
              <Button 
                onClick={() => onSubmit(handleSave)}
                size="sm" 
                className="w-full sm:w-auto transition-all"
              >
                Save Form
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
