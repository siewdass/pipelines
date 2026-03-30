import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { 
  HiChevronLeft, 
  HiOutlineTableCells, 
  HiOutlinePuzzlePiece, 
  HiOutlineSquares2X2 
} from "react-icons/hi2";
import { useQuery } from "../../hooks/useFetch";
import { DataGrid } from "../../components/tables/DataGrid";

export default function ProjectData() {
  const { id, tableId } = useParams();
  const navigate = useNavigate();

  // Fetch documents and schema (associations)
  const [result, loading] = useQuery<any>(
    `docs-${tableId}`, 
    `/database/fetch`, 
    { collection: tableId }
  );

  const docs = result?.docs || [];
  const associations = result?.schema || {};
  const fields = result?.fields || {};

  const getFieldType = (key: string, value: any) => {
    if (associations[key]) return 'Relation';
    if (fields[key]) return fields[key]; // From official schema
    if (Array.isArray(value)) return 'Array';
    if (value === null) return 'Null';
    return typeof value;
  };

  const renderValue = (key: string, value: any) => {
    // Check if this field is an association
    const assoc = associations[key];

    if (assoc) {
      const count = Array.isArray(value) ? value.length : (value ? 1 : 0);
      return (
        <button 
          onClick={() => navigate(`/projects/projectdata/${id}/${assoc.collection}`)}
          className="inline-flex items-center gap-1.5 hover:text-brand-500 font-semibold text-brand-600 dark:text-brand-400 transition-colors group"
        >
          <HiOutlinePuzzlePiece className="size-4" />
          {assoc.collection} ({count} items)
        </button>
      );
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return `[ ${value.length} items ]`;
      }
      return '{ Object }';
    }

    return (
      <span className="text-gray-800 dark:text-gray-200 font-medium" title={String(value)}>
        {String(value)}
      </span>
    );
  };

  return (
    <div className="w-full">
      <PageMeta
        title={`${tableId} | Project Data`}
        description={`Browsing data for table ${tableId}`}
      />
      <PageBreadcrumb pageTitle="Table Data" />
      
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/projects/projecttables/${id}`)}
                className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <HiChevronLeft className="size-6" />
              </button>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 uppercase tracking-tight flex items-center gap-2">
                  <HiOutlineTableCells className="size-6 text-brand-500" />
                  {tableId}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Browsing all records in this table
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
               <HiOutlineSquares2X2 className="size-4 text-gray-400" />
               <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                 {docs.length} Documents
               </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : docs.length > 0 ? (
            <DataGrid 
              className="!grid-cols-1"
              data={docs}
              renderItem={(doc: any) => (
                <div className="group h-full bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {Object.entries(doc).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-4 py-3 px-5 sm:px-6 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <span className="w-1/4 sm:w-1/5 xl:w-[15%] text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0 break-all">
                          {key === '_id' ? 'ID' : key}
                        </span>
                        <div className="flex-1 text-sm truncate text-gray-800 dark:text-gray-200">
                          {renderValue(key, value)}
                        </div>
                        <div className="shrink-0 text-right w-24">
                          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                            {getFieldType(key, value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          ) : (
            <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30 dark:bg-black/10">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-400 dark:bg-gray-800 mb-4">
                <HiOutlineTableCells className="size-10" />
              </div>
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Table is Empty</h5>
              <p className="max-w-xs mx-auto text-sm text-gray-500 dark:text-gray-400">
                No data records found for this table yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
