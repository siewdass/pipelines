import { useNavigate } from "react-router";
import { useAuthStore } from "../../state/auth";
import { 
  HiOutlineSquares2X2, 
  HiOutlineBolt, 
  HiOutlinePuzzlePiece, 
  HiSparkles, 
  HiOutlineArrowRight 
} from "react-icons/hi2";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/projects");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors duration-500 overflow-hidden selection:bg-brand-500/30">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 mx-auto max-w-7xl lg:px-8">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
            <HiOutlineSquares2X2 className="size-6" />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
            PIPELINES
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-white transition-colors">Features</a>
          <a href="#" className="text-sm font-bold text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-sm font-bold text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate("/signin")}
                className="text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-4 py-2 transition-colors"
               >
                Log in
              </button>
              <button 
                onClick={() => navigate("/signup")}
                className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-all active:scale-95 shadow-xl shadow-black/10"
              >
                Sign up
              </button>
            </>
          ) : (
             <button 
              onClick={() => navigate("/projects")}
              className="bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-all active:scale-95 shadow-xl shadow-brand-500/20"
            >
              Go to Projects
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 mx-auto max-w-7xl lg:px-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 mb-8 animate-fade-in-down">
          <HiSparkles className="size-4 text-brand-500" />
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Version 1.0 is now live</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tightest leading-[1.1] mb-8 max-w-5xl">
          Automate your <span className="bg-gradient-to-r from-brand-500 to-blue-400 bg-clip-text text-transparent">data pipelines</span> with ease.
        </h1>

        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-12 font-medium">
          A powerful, dynamic API-driven engine to manage collections, relationships, and metrics without writing a single line of backend code.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up">
          <button 
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 bg-brand-500 text-white rounded-2xl font-black text-lg hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-brand-500/30 group"
          >
            Get Started Free <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
            View Demo
          </button>
        </div>

        {/* Dashboard Preview Image Placeholder */}
        <div className="mt-20 w-full max-w-5xl p-2 rounded-[2.5rem] bg-gradient-to-b from-gray-200/50 to-transparent dark:from-white/10 border border-white/20 shadow-2xl animate-reveal">
           <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-900 rounded-[2rem] overflow-hidden relative border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 grayscale select-none">
                 <HiOutlineSquares2X2 className="size-64 text-brand-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent"></div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-32 mx-auto max-w-7xl lg:px-8 border-t border-gray-100 dark:border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Built for scale.</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Everything you need to ship production-ready applications faster.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<HiOutlineBolt />} 
            title="Real-time Metrics" 
            desc="Track every request, error, and latency peak in real-time with beautiful charts."
          />
          <FeatureCard 
            icon={<HiOutlinePuzzlePiece />} 
            title="Dynamic Relations" 
            desc="One-to-many, many-to-many. Define relationships in JSON and we handle the pivot logic."
          />
          <FeatureCard 
            icon={<HiSparkles />} 
            title="Security First" 
            desc="Built-in JWT authentication and project-level guards out of the box."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-100 dark:border-white/5 text-center">
        <p className="text-sm text-gray-400 font-medium">© 2026 Pipelines — Designed with precision.</p>
      </footer>

      {/* Custom Styles for animations */}
      <style>{`
        @keyframes reveal {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-reveal {
          animation: reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .tracking-tightest { letter-spacing: -0.05em; }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
      <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
