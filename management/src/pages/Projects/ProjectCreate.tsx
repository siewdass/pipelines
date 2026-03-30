import { useNavigate } from "react-router";
import { useEffect } from "react";
import { HiChevronLeft } from "react-icons/hi2";
import { useForm } from "../../hooks/useForm";
import Button from "../../components/ui/button/Button";
import { useMutate } from "../../hooks/useFetch";

const SCHEMA = {
  type: 'vertical',
  items: [
    { type: 'string', name: 'name', label: 'Project Name', required: true, min: 3 },
    { type: 'string', name: 'description', label: 'Description' }
  ]
}

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [onSubmit, Form] = useForm<Record<string, unknown>>(SCHEMA);
  const [createProject, creating, result] = useMutate<any>('post', '/project/create', 'projects');

  useEffect(() => {
    if (result) {
      navigate('/projects');
    }
  }, [result, navigate]);

  const handleSave = (formData: any) => {
    createProject(formData);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
      <div className="flex items-center gap-4 mb-5 lg:mb-7">
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <HiChevronLeft className="size-6" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Project Details
        </h3>
      </div>
      
      <div className="space-y-6 w-full">
        <Form className="w-full" />
        <div className="flex w-full mt-8">
          <Button 
            onClick={() => onSubmit(handleSave)}
            size="sm" 
            disabled={creating}
            className="w-full sm:w-auto transition-all"
          >
            {creating ? 'Creating...' : 'Save Project'}
          </Button>
        </div>
      </div>
    </div>
  );
}
