import { useNavigate } from "react-router";
import { useEffect } from "react";
import { HiCheck } from "react-icons/hi2";
import { useForm } from "../../hooks/useForm";
import Button from "../../components/ui/button/Button";
import { useMutate } from "../../hooks/useFetch";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";

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
    <div className="w-full">
      <PageMeta
        title="Project Creation | Pipelines Infrastructure"
        description="Create a new project in Pipelines."
      />
      <div className="space-y-5">
        <PageHeader
          backTo="/projects"
          title="Project Creation"
          subtitle="Create a new project to get started."
        >
          <Button 
            onClick={() => onSubmit(handleSave)}
            size="sm" 
            disabled={creating}
            className="gap-2 bg-brand-500 hover:bg-brand-600 text-white border-0 shadow-sm !py-2.5"
          >
            {creating ? <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div><span className="hidden md:inline"> Saving...</span></> : <><HiCheck className="size-4" /><span className="hidden md:inline">Save</span></>}
          </Button>
        </PageHeader>
        <div className="w-full">
          <Form className="w-full" />
        </div>
      </div>
    </div>
  );
}
