import { useNavigate } from "react-router";
import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { DataGrid } from "../../components/tables/DataGrid";
import { useQuery } from "../../hooks/useFetch";
import { PlusIcon, PieChartIcon, TableIcon, ShootingStarIcon, SettingsIcon } from "../../icons";

export default function ProjectList() {
  const [projects, loading] = useQuery<any[]>('projects', '/project/list');
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const toolbar = selected ? (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => navigate(`/projects/metrics/${selected}`)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-theme-xs"
      >
        <PieChartIcon className="size-4" /> <span className="hidden md:inline">Metrics</span>
      </button>
      <button 
        onClick={() => navigate(`/projects/projecttables/${selected}`)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-theme-xs"
      >
        <TableIcon className="size-4" /> <span className="hidden md:inline">Database</span>
      </button>
      <button 
        onClick={() => navigate(`/projects/assemble/${selected}`)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-theme-xs"
      >
        <ShootingStarIcon className="size-4" /> <span className="hidden md:inline">Assemble</span>
      </button>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

      <button 
        onClick={() => navigate(`/projects/details/${selected}`)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-theme-xs"
      >
        <SettingsIcon className="size-4" /> <span className="hidden md:inline">Settings</span>
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-3">
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
      title="Projects List" 
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
              onClick={() => setSelected(selected === item._id ? null : item._id)}
              className={`p-5 border rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all cursor-pointer group ${selected === item._id ? 'border-brand-500 ring-1 ring-brand-500 dark:ring-brand-500/50 dark:border-brand-500' : 'border-gray-200 dark:border-gray-800'}`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500 transition-colors">
                  {item.name}
                </h4>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${item.status === 'active' ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {item.status || 'Active'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 min-h-[50px]">
                {item.description || 'No description provided.'}
              </p>
            </div>
          )}
        />
      )}
    </ComponentCard>
  );
}
