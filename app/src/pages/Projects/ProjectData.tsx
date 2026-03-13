import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { ChevronLeftIcon } from "../../icons";
import { useQuery } from "../../hooks/useFetch";
import ComponentCard from "../../components/common/ComponentCard";

export default function ProjectData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, loading] = useQuery<any>(`project-${id}`, `/project/${id}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageMeta
        title={`${project?.name || 'Project'} | Project Data`}
        description="Configuration and technical data for the project."
      />
      <PageBreadcrumb pageTitle="Project Data" />
      
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
          <div className="flex items-center gap-4 mb-5 lg:mb-7">
            <button 
              onClick={() => navigate(`/projects/details/${id}`)}
              className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Project Tables
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {project?.name} - Technical Configuration
              </p>
            </div>
          </div>
          
          <ComponentCard title="Configuration Table" desc="Specific technical keys and values for this project.">
            <div className="p-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400">
                No technical data configured yet for {project?.name}. 
              </p>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
