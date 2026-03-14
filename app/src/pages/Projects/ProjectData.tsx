import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { ChevronLeftIcon, TableIcon } from "../../icons";
import { useQuery } from "../../hooks/useFetch";

export default function ProjectData() {
  const { id, tableId } = useParams();
  const navigate = useNavigate();

  // Now using useQuery for fetching data via GET with URL params
  const [result, loading] = useQuery<any>(
    `docs-${tableId}`, 
    `/database/fetch`, 
    { collection: tableId }
  );

  const docs = result?.docs || [];

  return (
    <div className="w-full">
      <PageMeta
        title={`${tableId} | Project Data`}
        description={`Browsing data for collection ${tableId}`}
      />
      <PageBreadcrumb pageTitle="Collection Data" />
      
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate(`/projects/projecttables/${id}`)}
              className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 uppercase tracking-tight">
                {tableId}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Browsing all documents in this collection
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : docs.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <tr>
                    {Object.keys(docs[0] || {}).map((header: string) => (
                      <th 
                        key={header}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest"
                      >
                        {header === '_id' ? 'ID' : header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {docs.map((doc: any, idx: number) => (
                    <tr key={doc._id || idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      {Object.values(doc).map((val: any, i: number) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {typeof val === 'object' && val !== null ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-50 dark:bg-brand-500/10 text-brand-500 text-[10px] font-bold">
                              {Array.isArray(val) ? `[ ${val.length} items ]` : '{ Object }'}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30 dark:bg-black/10">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-400 dark:bg-gray-800 mb-4">
                <TableIcon className="size-10" />
              </div>
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Collection is Empty</h5>
              <p className="max-w-xs mx-auto text-sm text-gray-500 dark:text-gray-400">
                No data records found for this collection yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
