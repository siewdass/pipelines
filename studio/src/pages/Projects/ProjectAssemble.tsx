import { useParams } from "react-router";
import { useState, useRef, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../components/common/PageHeader";
import { 
  HiSparkles,
  HiOutlineCubeTransparent,
  HiOutlineChatBubbleLeftRight,
  HiOutlineEye,
  HiOutlineArrowDownTray,
  HiChevronRight
} from "react-icons/hi2";
import { useQuery, useMutate } from "../../hooks/useFetch";
import Button from "../../components/ui/button/Button";
import { useToast } from "../../hooks/useToast";

export default function ProjectAssemble() {
  const { id } = useParams();
  const [promptInput, setPromptInput] = useState("");
  const [activeTab, setActiveTab] = useState<'features' | 'prompts' | 'preview'>('prompts');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [previewKey, setPreviewKey] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toast = useToast();
  
  const [project] = useQuery<any>(`project-${id}`, `/project/${id}`);
  const [prompts, loadingPrompts, refetch] = useQuery<any[]>(`assemble-prompts-${id}`, `/assemble/prompts/${id}`);
  const [features, loadingFeatures, refetchFeatures] = useQuery<any>(`assemble-features-${id}`, `/assemble/features/${id}`);
  const [sources, loadingSources, refetchSources] = useQuery<any[]>(`sources-${id}`, `/source/${id}`);

  const [sendPrompt, sending] = useMutate('post', `/assemble/prompts`, `assemble-prompts-${id}`);
  const [compileRuntime, compiling] = useMutate('post', `/assemble/compile/${id}`, `compile-${id}`);

  const latestSourceId = sources?.[0]?._id || '';
  useEffect(() => {
    if (!selectedSourceId && latestSourceId) setSelectedSourceId(latestSourceId);
  }, [latestSourceId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [prompts, sending, loadingPrompts, activeTab]);

  const handleSend = async () => {
    if (!promptInput.trim() || sending) return;
    
    const text = promptInput;
    setPromptInput("");

    try {
      await sendPrompt({
        prompt: text,
        projectId: id,
        basedOnSourceId: selectedSourceId || undefined,
      });
      await Promise.all([refetch(), refetchFeatures(), refetchSources()]);
    } catch {
      setPromptInput(text);
      toast.error("Failed to send prompt.");
    }
  };

  const handleCompile = async () => {
    if (!selectedSourceId) {
      toast.error("No source version selected. Generate code first.");
      return;
    }
    try {
      await compileRuntime({ sourceId: selectedSourceId });
      setPreviewKey(k => k + 1);
      toast.success("Runtime compiled successfully!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to compile runtime.");
    }
  };

  const handleDownload = () => {
    const baseUrl = window.location.origin
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pipelines | ${project.name}</title>
</head>
<body style="background-color: #000; margin: 0;">
  <script>window.PIPELINES = "${project.token}"; window.PIPELINES_API = "${baseUrl}";<\/script>
  <script src="${baseUrl}/serve/loader.js?project-id=${project.token}"><\/script>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("index.html downloaded!");
  };

  if (!project) return null;

  const featuresList = features?.features || [];

  const previewUrl = `/serve/html?project-id=${project.token}&baseUrl=${encodeURIComponent(window.location.origin)}`;

  const selectedIdx = sources?.findIndex((s: any) => s._id === selectedSourceId) ?? -1
  const selectedVersion = selectedIdx >= 0 ? sources.length - selectedIdx : (sources?.length ?? 0)

  const tabClass = (tab: string) =>
    activeTab === tab
      ? "text-brand-500 border-b-2 border-brand-500 font-semibold"
      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200";

  return (
    <div className="w-full flex flex-col h-[calc(100vh-110px)] md:h-[calc(100vh-125px)] lg:h-[calc(100vh-140px)] gap-4 md:gap-6">
      <PageMeta
        title={`${project.name} | Assemble UI`}
        description="Talk to AI to assemble visual interfaces."
      />
      
      <PageHeader back title="Assemble" subtitle={`${project.name} - Build with AI`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-white rounded-lg px-4 py-2.5 text-sm transition"
          >
            <HiOutlineArrowDownTray className="size-4" />
            <span className="hidden md:inline">Download</span>
          </button>
          <Button 
            onClick={handleCompile} 
            disabled={compiling}
            className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white border-0 shadow-sm !py-2.5"
          >
            {compiling ? (
               <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : (
               <HiSparkles className="size-4" />
            )}
            {compiling ? <span className="hidden md:inline">Building...</span> : <span className="hidden md:inline">Build</span>}
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-2 py-3 text-sm transition-colors ${tabClass('prompts')}`}
            >
              <HiOutlineChatBubbleLeftRight className="size-4" />
              <span className="hidden md:inline">Prompts</span>
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`flex items-center gap-2 py-3 text-sm transition-colors ${tabClass('features')}`}
            >
              <HiOutlineCubeTransparent className="size-4" />
              <span className="hidden md:inline">Features</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 py-3 text-sm transition-colors ${tabClass('preview')}`}
            >
              <HiOutlineEye className="size-4" />
              <span className="hidden md:inline">Preview</span>
            </button>
          </div>
          {sources && sources.length > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                v{selectedVersion}
                <svg className="size-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 min-w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    {sources.map((s: any, idx: number) => {
                      const d = s.createdAt ? new Date(s.createdAt) : null
                      const dateStr = d ? `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()} — ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}` : ''
                      return (
                      <button
                        key={s._id}
                        onClick={() => { setSelectedSourceId(s._id); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${s._id === selectedSourceId ? 'bg-gray-50 dark:bg-gray-700/30 font-medium text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        v{sources.length - idx} — {dateStr}
                      </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'prompts' ? (
          <>
            {/* Chat Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {loadingPrompts ? (
                 <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
              ) : prompts?.length === 0 ? (
                 <div className="flex h-full items-center justify-center text-center">
                    <div className="max-w-md">
                       <HiSparkles className="size-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                       <p className="text-gray-500 dark:text-gray-400">This project has no layout code yet. Describe your interface layout and Gemini will generate a production-ready JSX bundle.</p>
                    </div>
                 </div>
              ) : (
                 prompts?.map(msg => (
                    <div key={msg._id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-brand-500 text-white rounded-br-none' : 'bg-gray-50 border border-gray-200 dark:border-gray-800 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                          {msg.role === 'model' ? (
                              <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed overflow-x-auto">{msg.content}</pre>
                          ) : (
                              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.content}</p>
                          )}
                       </div>
                    </div>
                 ))
              )}
              {sending && (
                 <div className="flex justify-start">
                   <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1.5 shadow-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} className="h-1 lg:h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
               <form 
                  onSubmit={e => { e.preventDefault(); handleSend(); }}
                  className="flex gap-3 max-w-4xl mx-auto items-end"
               >
                  <textarea 
                     value={promptInput}
                     onChange={e => setPromptInput(e.target.value)}
                     onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSend();
                        }
                     }}
                     placeholder="Ej. Añade una tabla para visualizar a los usuarios, la tabla toma un array 'users'..."
                     className="w-full flex-1 max-h-40 min-h-[52px] p-3.5 text-sm border border-gray-200 dark:border-gray-700/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl bg-white dark:bg-gray-800 dark:text-white resize-y outline-none transition-all shadow-sm"
                     disabled={sending}
                     autoFocus
                  />
                  <Button 
                    type="submit" 
                    disabled={!promptInput.trim() || sending} 
                    className="h-[52px] px-6 shrink-0 shadow-sm"
                  >
                     Send
                  </Button>
               </form>
            </div>
          </>
        ) : activeTab === 'features' ? (
          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            {loadingFeatures ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : featuresList.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="max-w-md">
                  <HiOutlineCubeTransparent className="size-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No features yet. Go to the Prompts tab and describe your application to start generating features.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {featuresList.map((section: any, i: number) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-white/90">{section.name}</h4>
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{section.features?.length || 0}</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {section.features?.map((feat: any, j: number) => (
                        <div key={j} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <HiChevronRight className="size-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{feat.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{feat.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 bg-black rounded-b-2xl overflow-hidden">
            <iframe
              key={previewKey}
              src={previewUrl}
              className="w-full h-full border-0"
              title="App Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
