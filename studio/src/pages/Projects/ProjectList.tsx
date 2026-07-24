import { useNavigate } from "react-router";
import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { DataGrid } from "../../components/tables/DataGrid";
import { useQuery } from "../../hooks/useFetch";
import { api } from "../../services/api";
import { 
  HiPlus, 
  HiOutlineChartPie, 
  HiOutlineTableCells, 
  HiSparkles, 
  HiOutlineCog8Tooth, 
  HiOutlineUsers 
} from "react-icons/hi2";

export default function ProjectList() {
  const [projects, loading] = useQuery<any[]>('projects', '/project/list');
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const toolbar = selected ? (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => navigate(`/projects/assemble/${selected}`)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-theme-xs"
      >
        <HiSparkles className="size-4" /> <span className="hidden md:inline">Assemble</span>
      </button>

      <button 
        onClick={() => navigate(`/projects/settings/${selected}`)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-theme-xs"
      >
        <HiOutlineCog8Tooth className="size-4" /> <span className="hidden md:inline">Settings</span>
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <button 
        onClick={() => navigate('/projects/create')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
      >
        <HiPlus className="size-4" />
        <span className="hidden md:inline">Create Project</span>
      </button>
    </div>
  );

  return (
    <div className="w-full">
      <div className="space-y-3">
        <PageHeader
          title="Projects List"
          subtitle="A list of all your projects"
          className="mb-4 md:mb-5 lg:mb-6"
        >
          {toolbar}
        </PageHeader>
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
              onClick={async () => {
                const isSelected = selected === item._id;
                setSelected(isSelected ? null : item._id);
                
                // If selecting a project, pre-fetch its signed JWT token
                if (!isSelected) {
                  try {
                    const { data } = await api.get(`/project/${item._id}/token`);
                    localStorage.setItem('project-token', data.token);
                  } catch (err) {
                    console.error("Could not retrieve project identity token", err);
                  }
                }
              }}
              className={`p-5 border rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all cursor-pointer group ${selected === item._id ? 'border-brand-500 ring-1 ring-brand-500 dark:ring-brand-500/50 dark:border-brand-500' : 'border-gray-200 dark:border-gray-800'}`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500 transition-colors">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2">
                  {selected === item._id && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/projects/metrics/${selected}`); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Metrics"
                      >
                        <HiOutlineChartPie className="size-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/projects/schema/${selected}`); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Database"
                      >
                        <HiOutlineTableCells className="size-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/projects/users/${selected}`); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Users"
                      >
                        <HiOutlineUsers className="size-4" />
                      </button>
                    </>
                  )}
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${item.status === 'active' ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {item.status || 'Active'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 min-h-[50px]">
                {item.description || 'No description provided.'}
              </p>
            </div>
          )}
        />
      )}
      </div>
    </div>
  );
}
