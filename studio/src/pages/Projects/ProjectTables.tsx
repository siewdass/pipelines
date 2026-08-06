import { useNavigate, useParams } from "react-router";
import PageHeader from "../../components/common/PageHeader";
import PageMeta from "../../components/common/PageMeta";
import { 
  HiOutlineTableCells, 
  HiOutlineSquares2X2, 
  HiOutlinePuzzlePiece, 
  HiOutlineBolt 
} from "react-icons/hi2";
import { useQuery, useMutate } from "../../hooks/useFetch";
import ComponentCard from "../../components/common/ComponentCard";

export default function ProjectTables() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch project details
  const [project, projectLoading] = useQuery<any>(`project-${id}`, `/project/${id}`);
  const [tablesData, tablesLoading] = useQuery<any>(`tables-${id}`, `/database/tables`);
  const [updateTable, tableUpdating] = useMutate<any, any>('patch', `/database/tables`, `tables-${id}`);

  const loading = projectLoading || tablesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tables = tablesData?.collections || [];

  return (
    <div className="w-full">
      <PageMeta
        title={`${project?.name || 'Project'} | Project Schema`}
        description="Technical tables and schema for the project."
      />
      
      <div className="space-y-3">
        <PageHeader 
          back
          title="Project Schema"
          subtitle={`${project?.name} - Technical Configuration & Metrics`}
          className="mb-3 md:mb-5 lg:mb-6"
        />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
          
          {tables.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table: any) => {
                const associationsCount = Object.keys(table.associations || {}).length;
                
                return (
                  <div 
                    key={table.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900"
                  >
                    {/* Background Aura */}
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-500/5 blur-2xl transition-all duration-300 group-hover:bg-brand-500/10"></div>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                        <HiOutlineTableCells className="size-6" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() =>
                            updateTable({
                              overrideUrl: `/database/tables/${table.id}`,
                              access: table.access === 'private' ? 'public' : 'private',
                            })
                          }
                          disabled={tableUpdating}
                          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                            table.access === 'private'
                              ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}
                          title={table.access === 'private' ? 'Private source - requires permissions to read/write' : 'Public source - readable/writable by anyone'}
                        >
                          {table.access === 'private' ? 'Locked' : 'Public'}
                        </button>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Storage</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{table.sizeKb} KB</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">
                      {table.name}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <HiOutlineSquares2X2 className="size-3" /> Count
                        </span>
                        <span className="text-lg font-black text-gray-800 dark:text-white">
                          {table.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <HiOutlinePuzzlePiece className="size-3" /> Relations
                        </span>
                        <span className="text-lg font-black text-gray-800 dark:text-white">
                          {associationsCount}
                        </span>
                      </div>
                      <div className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 col-span-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <HiOutlineBolt className="size-3" /> Average Object Size
                            </span>
                            <span className="text-xs font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
                                {table.avgObjSize} bytes
                            </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/projects/projectdata/${id}/${table.id}`)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-500 active:scale-95 dark:bg-white/10 dark:hover:bg-brand-500"
                    >
                      View Documents
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30 dark:bg-black/10">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-400 dark:bg-gray-800 mb-4">
                <HiOutlineTableCells className="size-10" />
              </div>
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Data Detected</h5>
              <p className="max-w-xs mx-auto text-sm text-gray-500 dark:text-gray-400">
                Schemas are automatically created when you perform mutations with associations. 
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
