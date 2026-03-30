import { useNavigate, useParams } from "react-router";
import { useState, useRef, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { 
  HiChevronLeft, 
  HiSparkles 
} from "react-icons/hi2";
import { useQuery, useMutate } from "../../hooks/useFetch";
import Button from "../../components/ui/button/Button";
import { useToast } from "../../hooks/useToast";

export default function ProjectAssemble() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promptInput, setPromptInput] = useState("");
  const toast = useToast();
  
  const [project] = useQuery<any>(`project-${id}`, `/project/${id}`);
  const [prompts, loadingPrompts, refetch] = useQuery<any[]>(`assemble-prompts-${id}`, `/assemble/prompts/${id}`);
  
  const [sendPrompt, sending] = useMutate('post', `/assemble/prompts`, `assemble-prompts-${id}`);
  const [compileRuntime, compiling] = useMutate('post', `/assemble/compile/${id}`, `compile-${id}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [prompts, sending]);

  const handleSend = async () => {
    if (!promptInput.trim() || sending) return;
    
    const text = promptInput;
    setPromptInput("");

    try {
      await sendPrompt({ prompt: text, projectId: id });
      refetch();
    } catch {
      setPromptInput(text); // reset on error
      toast.error("Failed to send prompt.");
    }
  };

  const handleCompile = async () => {
    try {
      await compileRuntime({});
      toast.success("Runtime compiled successfully!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to compile runtime.");
    }
  };

  if (!project) return null;

  return (
    <div className="w-full flex flex-col lg:h-[calc(100vh-140px)] gap-6">
      <PageMeta
        title={`${project.name} | Assemble UI`}
        description="Talk to AI to assemble visual interfaces."
      />
      
      <div className="flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-4">
        <PageBreadcrumb pageTitle="Assemble AI Interface" />
        <Button 
          onClick={handleCompile} 
          disabled={compiling}
          className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white border-0 shadow-sm"
        >
          {compiling ? (
             <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          ) : (
             <HiSparkles className="size-4" />
          )}
          {compiling ? 'Compiling...' : 'Compile Runtime Build'}
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-10 w-10 shrink-0 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <HiChevronLeft className="size-5" />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {project.name} - Studio
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Write requirements and wait for the model to draft your frontend.
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
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
      </div>
    </div>
  );
}
