import { useState } from "react";
import { 
  HiOutlineUsers, 
  HiOutlineUserCircle, 
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
  HiOutlineKey,
  HiXMark,
  HiPlus,
  HiChevronLeft,
  HiCheck,
  HiOutlineTrash
} from "react-icons/hi2";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { useQuery, useMutate } from "../../hooks/useFetch";
import { useToast } from "../../hooks/useToast";
import { api } from "../../services/api";

const ProjectUsers: React.FC = () => {
  const [activeView, setActiveView] = useState<'users' | 'roles' | 'permissions'>('users');
  const toast = useToast();

  // --- Users ---
  const [data, loadingUsers, refetchUsers] = useQuery<{ success: boolean; users: any[] }>('project-users', '/user');
  const [createUser, creating] = useMutate('post', '/user', 'project-users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [assigningUser, setAssigningUser] = useState<string | null>(null);

  // --- Roles ---
  const [rolesData, loadingRoles, refetchRoles] = useQuery<{ success: boolean; roles: any[] }>('project-roles', '/user/roles');
  const [createRole, creatingRole] = useMutate('post', '/user/roles', 'project-roles');
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [assigningRole, setAssigningRole] = useState<string | null>(null);

  // --- Permissions ---
  const [permsData, loadingPerms, refetchPerms] = useQuery<{ success: boolean; permissions: any[] }>('project-permissions', '/user/roles/permissions');
  const [createPerm, creatingPerm] = useMutate('post', '/user/roles/permissions', 'project-permissions');
  const [showPermForm, setShowPermForm] = useState(false);
  const [permName, setPermName] = useState("");
  const [permResources, setPermResources] = useState("");
  const [permRead, setPermRead] = useState(true);
  const [permWrite, setPermWrite] = useState(true);

  const handleCreateUser = async () => {
    if (!email.trim()) return;
    try {
      await createUser({ email: email.trim(), name: name.trim() || undefined });
      toast.success("User created successfully!");
      setEmail(""); setName(""); setShowUserForm(false);
      refetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to create user.");
    }
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) return;
    try {
      await createRole({ name: roleName.trim(), description: roleDesc.trim() || undefined });
      toast.success("Role created successfully!");
      setRoleName(""); setRoleDesc(""); setShowRoleForm(false);
      refetchRoles();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to create role.");
    }
  };

  const handleCreatePerm = async () => {
    if (!permName.trim()) return;
    try {
      const resources = permResources.trim() ? permResources.split(',').map(r => r.trim()) : [];
      await createPerm({ name: permName.trim(), resources, read: permRead, write: permWrite });
      toast.success("Permission created successfully!");
      setPermName(""); setPermResources(""); setPermRead(true); setPermWrite(true); setShowPermForm(false);
      refetchPerms();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to create permission.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/user/${userId}`);
      toast.success("User deleted");
      refetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await api.delete(`/user/roles/${roleId}`);
      toast.success("Role deleted");
      refetchRoles();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete role.");
    }
  };

  const handleDeletePerm = async (permId: string) => {
    try {
      await api.delete(`/user/roles/permissions/${permId}`);
      toast.success("Permission deleted");
      refetchPerms();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete permission.");
    }
  };

  const toggleRoleForUser = async (userId: string, roleId: string, currentRoles: string[]) => {
    const hasRole = currentRoles.includes(roleId);
    const newRoles = hasRole ? currentRoles.filter(r => r !== roleId) : [...currentRoles, roleId];
    try {
      await api.patch(`/user/${userId}`, { roles: newRoles });
      toast.success(hasRole ? "Role removed" : "Role assigned");
      refetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update roles.");
    }
  };

  const togglePermForRole = async (roleId: string, permId: string, currentPerms: string[]) => {
    const hasPerm = currentPerms.includes(permId);
    const newPerms = hasPerm ? currentPerms.filter(p => p !== permId) : [...currentPerms, permId];
    try {
      await api.patch(`/user/roles/${roleId}`, { permissions: newPerms });
      toast.success(hasPerm ? "Permission removed" : "Permission assigned");
      refetchRoles();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update permissions.");
    }
  };

  const viewConfig = {
    users: { title: "Project Identity", desc: "Manage project users and granular access control.", icon: HiOutlineUsers },
    roles: { title: "Roles", desc: "Define roles and assign them to users.", icon: HiOutlineShieldCheck },
    permissions: { title: "Permissions", desc: "Configure granular resource access.", icon: HiOutlineKey }
  };

  const current = viewConfig[activeView];

  const rolesMap = new Map((rolesData?.roles || []).map((r: any) => [r._id, r]));
  const permsMap = new Map((permsData?.permissions || []).map((p: any) => [p._id, p]));

  return (
    <>
      <PageMeta
        title="Project Users | Pipelines Infrastructure"
        description="Manage identity and access for this specific project."
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {activeView !== 'users' && (
              <button
                onClick={() => { setActiveView(activeView === 'permissions' ? 'roles' : 'users'); setAssigningRole(null); setAssigningUser(null); }}
                className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-10 w-10 shrink-0 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <HiChevronLeft className="size-5" />
              </button>
            )}
            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-brand-500 rounded-2xl flex items-center justify-center shadow-inner">
               <current.icon className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{current.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{current.desc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {activeView === 'users' && (
              <button 
                onClick={() => { setActiveView('roles'); setAssigningUser(null); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <HiOutlineShieldCheck className="size-4" /> Roles
              </button>
            )}
            {activeView === 'roles' && (
              <button 
                onClick={() => { setActiveView('permissions'); setAssigningRole(null); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <HiOutlineKey className="size-4" /> Permissions
              </button>
            )}
            <button 
              onClick={() => {
                if (activeView === 'users') setShowUserForm(!showUserForm);
                if (activeView === 'roles') setShowRoleForm(!showRoleForm);
                if (activeView === 'permissions') setShowPermForm(!showPermForm);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 text-sm"
            >
              {(activeView === 'users' ? showUserForm : activeView === 'roles' ? showRoleForm : showPermForm) 
                ? <><HiXMark className="size-4" /> Cancel</>
                : <><HiPlus className="size-4" /> Create {activeView === 'users' ? 'User' : activeView === 'roles' ? 'Role' : 'Permission'}</>
              }
            </button>
          </div>
        </div>

        {/* Create Forms */}
        {activeView === 'users' && showUserForm && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">New User</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address *"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" autoFocus />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name (optional)"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
              <button onClick={handleCreateUser} disabled={!email.trim() || creating}
                className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {activeView === 'roles' && showRoleForm && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">New Role</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="Role name *"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" autoFocus />
              <input type="text" value={roleDesc} onChange={e => setRoleDesc(e.target.value)} placeholder="Description (optional)"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
              <button onClick={handleCreateRole} disabled={!roleName.trim() || creatingRole}
                className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                {creatingRole ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {activeView === 'permissions' && showPermForm && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">New Permission</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <input type="text" value={permName} onChange={e => setPermName(e.target.value)} placeholder="Permission name *"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" autoFocus />
              <input type="text" value={permResources} onChange={e => setPermResources(e.target.value)} placeholder="Resources (comma separated, default: *)"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => setPermRead(!permRead)}
                  className={`px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${permRead ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  Read
                </button>
                <button type="button" onClick={() => setPermWrite(!permWrite)}
                  className={`px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${permWrite ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  Write
                </button>
              </div>
              <button onClick={handleCreatePerm} disabled={!permName.trim() || creatingPerm}
                className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                {creatingPerm ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {activeView === 'users' && (
          <ComponentCard title="Active Users" desc="Users that have access to this project resources.">
            {loadingUsers ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : data?.users && data.users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.users.map((user) => (
                  <div key={user._id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/5 hover:border-brand-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center">
                        <HiOutlineUserCircle className="size-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{user.name || 'Pipelines User'}</h4>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setAssigningUser(assigningUser === user._id ? null : user._id)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${assigningUser === user._id ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                          {assigningUser === user._id ? 'Done' : 'Roles'}
                        </button>
                        {user.roles?.some((r: string) => rolesMap.get(r)?.name === 'admin') ? null : (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          >
                            <HiOutlineTrash className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800 mb-2">
                      <HiOutlineEnvelope className="size-4 opacity-50" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {/* Current roles */}
                    {user.roles?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {user.roles.map((roleId: string, i: number) => {
                          const role = rolesMap.get(roleId);
                          return (
                            <span key={i} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center gap-1">
                              <HiOutlineShieldCheck className="size-3" />
                              {role?.name || roleId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {/* Assign roles panel */}
                    {assigningUser === user._id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Assign Roles</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(rolesData?.roles || []).map((role: any) => {
                            const isAssigned = (user.roles || []).includes(role._id);
                            return (
                              <button
                                key={role._id}
                                onClick={() => toggleRoleForUser(user._id, role._id, user.roles || [])}
                                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${isAssigned ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'}`}
                              >
                                {isAssigned ? <HiCheck className="size-3" /> : <HiPlus className="size-3" />}
                                {role.name}
                              </button>
                            );
                          })}
                          {(rolesData?.roles || []).length === 0 && (
                            <p className="text-xs text-gray-400">No roles available. Create one first.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiOutlineUsers className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Users Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">Click "Create User" to add members to this project.</p>
              </div>
            )}
          </ComponentCard>
        )}

        {activeView === 'roles' && (
          <ComponentCard title="Project Roles" desc="Roles define groups of permissions for users.">
            {loadingRoles ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : rolesData?.roles && rolesData.roles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rolesData.roles.map((role) => (
                  <div key={role._id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/5 hover:border-brand-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                        <HiOutlineShieldCheck className="size-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{role.name}</h4>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setAssigningRole(assigningRole === role._id ? null : role._id)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${assigningRole === role._id ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                          {assigningRole === role._id ? 'Done' : 'Perms'}
                        </button>
                        {role.name === 'admin' ? null : (
                          <button
                            onClick={() => handleDeleteRole(role._id)}
                            className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          >
                            <HiOutlineTrash className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {role.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 pl-[52px]">{role.description}</p>
                    )}
                    {/* Current permissions */}
                    {role.permissions?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {role.permissions.map((permId: string, i: number) => {
                          const perm = permsMap.get(permId);
                          return (
                            <span key={i} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center gap-1">
                              <HiOutlineKey className="size-3" />
                              {perm?.name || permId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {/* Assign permissions panel */}
                    {assigningRole === role._id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Assign Permissions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(permsData?.permissions || []).map((perm: any) => {
                            const isAssigned = (role.permissions || []).includes(perm._id);
                            return (
                              <button
                                key={perm._id}
                                onClick={() => togglePermForRole(role._id, perm._id, role.permissions || [])}
                                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${isAssigned ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}
                              >
                                {isAssigned ? <HiCheck className="size-3" /> : <HiPlus className="size-3" />}
                                {perm.name}
                              </button>
                            );
                          })}
                          {(permsData?.permissions || []).length === 0 && (
                            <p className="text-xs text-gray-400">No permissions available. Create one first.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiOutlineShieldCheck className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Roles Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">Click "Create Role" to define access groups.</p>
              </div>
            )}
          </ComponentCard>
        )}

        {activeView === 'permissions' && (
          <ComponentCard title="Permissions" desc="Granular access control for project resources.">
            {loadingPerms ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : permsData?.permissions && permsData.permissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permsData.permissions.map((perm) => (
                  <div key={perm._id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/5 hover:border-brand-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                        <HiOutlineKey className="size-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{perm.name}</h4>
                        <div className="flex gap-2 mt-1">
                          {perm.read && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">Read</span>}
                          {perm.write && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Write</span>}
                        </div>
                      </div>
                      {perm.name === 'all_access' ? null : (
                        <button
                          onClick={() => handleDeletePerm(perm._id)}
                          className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0"
                        >
                          <HiOutlineTrash className="size-3.5" />
                        </button>
                      )}
                    </div>
                    {perm.resources?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pl-[52px]">
                        {perm.resources.map((r: string, i: number) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HiOutlineKey className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Permissions Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">Click "Create Permission" to define resource access rules.</p>
              </div>
            )}
          </ComponentCard>
        )}
      </div>
    </>
  );
};

export default ProjectUsers;
