import { 
  HiOutlineUsers, 
  HiOutlineUserCircle, 
  HiOutlineEnvelope 
} from "react-icons/hi2";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { useQuery } from "../../hooks/useFetch";

const ProjectUsers: React.FC = () => {
  const [data, loading] = useQuery<{ success: boolean; users: any[] }>('project-users', '/user');

  return (
    <>
      <PageMeta
        title="Project Users | Pipelines Infrastructure"
        description="Manage identity and access for this specific project."
      />
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-brand-500 rounded-2xl flex items-center justify-center shadow-inner">
               <HiOutlineUsers className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Project Identity</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Manage project users and granular access control.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 text-sm">
                Add User to Project
             </button>
          </div>
        </div>

        <ComponentCard 
           title="Active Users" 
           desc="Users that have access to this project resources."
        >
           {loading ? (
             <div className="flex items-center justify-center p-12">
               <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
           ) : data?.users && data.users.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.users.map((user) => (
                  <div key={user._id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/5 hover:border-brand-500/30 transition-all group">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center">
                           <HiOutlineUserCircle className="size-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-gray-900 dark:text-white truncate">{user.name || 'Pipelines User'}</h4>
                           <p className="text-xs text-brand-500 font-bold uppercase tracking-wider">{user.roles?.[0] || 'Member'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                        <HiOutlineEnvelope className="size-4 opacity-50" />
                        <span className="truncate">{user.email}</span>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <HiOutlineUsers className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure Identity Engine</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">Connecting to the project isolation API... Soon you'll be able to manage all identities for this specific context.</p>
             </div>
           )}
        </ComponentCard>
      </div>
    </>
  );
};

export default ProjectUsers;
