import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import { DataGrid } from "../../components/tables/DataGrid";
import { useQuery } from "../../hooks/useFetch";
import { FilterIcon, PlusIcon } from "../../icons";

export default function ProjectList() {
  const [projects, loading] = useQuery<any[]>('projects', '/project/list');
  const navigate = useNavigate();

  const toolbar = (
    <div className="flex items-center gap-3">
      <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-colors">
        <FilterIcon className="size-5" />
        Filter
      </button>
      <button 
        onClick={() => navigate('/projects/create')}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
      >
        <PlusIcon className="size-5" />
        Create Project
      </button>
    </div>
  );

  return (
    <ComponentCard 
      title="Active Projects Grid" 
      desc="A list of all your current projects and their status."
      toolbar={toolbar}
    >
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : projects?.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-gray-200 rounded-2xl dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No projects found. Create your first project to get started.</p>
        </div>
      ) : (
        <DataGrid
          data={projects || []}
          renderItem={(item) => (
            <div 
              onClick={() => navigate(`/projects/details/${item._id}`)}
              className="p-4 border border-gray-200 rounded-xl dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500 transition-colors">
                  {item.name}
                </h4>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${item.status === 'active' ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {item.status || 'Active'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px]">
                {item.description || 'No description provided.'}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  ID: {item._id.substring(0, 8)}...
                </span>
                <button className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                  Configure
                </button>
              </div>
            </div>
          )}
        />
      )}
    </ComponentCard>
  );
}
