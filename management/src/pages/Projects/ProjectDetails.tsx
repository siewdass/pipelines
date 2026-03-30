import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { 
  HiChevronLeft, 
  HiPlus, 
  HiOutlineTrash, 
  HiSparkles 
} from "react-icons/hi2";
import { useQuery, useMutate } from "../../hooks/useFetch";
import Button from "../../components/ui/button/Button";
import { Switch } from "../../components/ui/Switch";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newOriginUrl, setNewOriginUrl] = useState("");
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState<string | null>(null);
  
  // Queries
  const [project, loadingProject] = useQuery<any>(`project-${id}`, `/project/${id}`);
  const [origins, loadingOrigins] = useQuery<any[]>(`origins-${id}`, `/project/${id}/origins`);
  const [emailSettings, loadingEmail] = useQuery<any>(`email-${id}`, `/project/${id}/email-settings`);

  // Mutations
  const [regenerate, regenerating] = useMutate('patch', `/project/${id}/token`, `project-${id}`);
  const [updateStatus, updatingStatus] = useMutate('patch', `/project/${id}/status`, `project-${id}`);
  const [addOrigin, adding] = useMutate('post', `/project/${id}/origins`, `origins-${id}`);
  const [removeOrigin, removing] = useMutate('delete', `/project/${id}/origins`, `origins-${id}`);
  const [saveEmail, savingEmail] = useMutate('post', `/project/${id}/email-settings`, `email-${id}`);

  // Derived state to avoid sync setState in useEffect
  const currentEmail = emailInput !== null ? emailInput : (emailSettings?.email || "");
  const currentToken = tokenInput !== null ? tokenInput : (emailSettings?.token || "");

  const handleAddOrigin = () => {
    if (!newOriginUrl.trim()) return;
    addOrigin({ url: newOriginUrl });
    setNewOriginUrl("");
  };

  const handleRemoveOrigin = (originId: string) => {
    removeOrigin({ overrideUrl: `/project/${id}/origins/${originId}` });
  };

  const handleSaveEmail = () => {
    saveEmail({ email: currentEmail, token: currentToken });
  };

  const toggleStatus = (checked: boolean) => {
    updateStatus({ status: checked ? 'active' : 'inactive' });
  };

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">Project not found.</p>
        <Button onClick={() => navigate('/projects')} className="mt-4">Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageMeta
        title={`${project.name} | Project Details`}
        description="View and manage specific project details."
      />
      <PageBreadcrumb pageTitle="Project Details" />
      
      <div className="space-y-6">
        {/* Main Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
          <div className="flex items-center gap-4 mb-5 lg:mb-7">
            <button 
              onClick={() => navigate('/projects')}
              className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <HiChevronLeft className="size-6" />
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Overview & Security
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <HiSparkles className="size-4 text-brand-500" />
                General Information
              </h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block font-medium">Description</label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="text-xs text-gray-400 block font-medium">Status</label>
                    <span className={`inline-flex mt-1 text-xs font-semibold ${project.status === 'active' ? 'text-success-600 dark:text-success-400' : 'text-gray-400'}`}>
                      {project.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Switch 
                    checked={project.status === 'active'} 
                    onChange={toggleStatus}
                    disabled={updatingStatus}
                  />
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2 font-semibold">
                Security & Access
              </h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2 font-medium">Project Token</label>
                  <div className="group relative">
                    <code className="block w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-brand-500 break-all">
                      {project.token}
                    </code>
                  </div>
                </div>
                
                <div className="pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-500/10 transition-all font-medium"
                    onClick={() => regenerate({})}
                    disabled={regenerating}
                  >
                    {regenerating ? 'Regenerating...' : 'Regenerate Token'}
                  </Button>
                  <p className="mt-2 text-[10px] text-gray-400 text-center leading-relaxed">
                    Warning: Regenerating the token will invalidate the previous one immediately. Any services using the old token will lose access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Origins Management Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Allowed Origins
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage which domains or systems can interact with this project.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <input 
                  type="text" 
                  placeholder="e.g. https://myapp.com" 
                  value={newOriginUrl}
                  onChange={(e) => setNewOriginUrl(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-gray-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOrigin()}
                />
              </div>
              <Button 
                onClick={handleAddOrigin} 
                disabled={adding || !newOriginUrl.trim()}
                className="shrink-0 gap-2"
                size="sm"
              >
                <HiPlus className="size-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {loadingOrigins ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !origins || origins.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                <p className="text-sm text-gray-400">No origins defined. Traffic from any source might be blocked.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {origins.map((origin: any) => (
                  <div 
                    key={origin._id}
                    className="flex items-center justify-between p-3 px-4 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-xl hover:border-brand-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {origin.url}
                      </span>
                    </div>
                    
                    <button 
                      className={`p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ${removing ? 'cursor-not-allowed' : ''}`}
                      onClick={() => handleRemoveOrigin(origin._id)}
                      disabled={removing}
                    >
                      <HiOutlineTrash className={`size-4 ${removing ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Settings Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Email Settings
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure the email provider and API token to enable transactional email features for this project.
              </p>
            </div>
            
            <div className="shrink-0">
              <Button 
                onClick={handleSaveEmail} 
                disabled={
                  savingEmail || 
                  !currentEmail.trim() || 
                  !currentToken.trim() || 
                  (currentEmail === (emailSettings?.email || "") && currentToken === (emailSettings?.token || ""))
                }
                size="sm"
              >
                {savingEmail ? 'Saving...' : 'Save Email Settings'}
              </Button>
            </div>
          </div>

          {loadingEmail ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs text-gray-400 block mb-2 font-medium">Sender Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. no-reply@myapp.com" 
                  name="project_email_sender_disable_autofill"
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  value={currentEmail}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-gray-200"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-2 font-medium">Provider Token (API Key)</label>
                <input 
                  type="password" 
                  placeholder="Enter your email provider's token" 
                  name="project_email_token_disable_autofill"
                  autoComplete="new-password"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  value={currentToken}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-gray-200"
                />
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
