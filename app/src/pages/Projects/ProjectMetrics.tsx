import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { ChevronLeftIcon, BoltIcon, PieChartIcon, GroupIcon, ArrowUpIcon } from "../../icons";
import { useQuery } from "../../hooks/useFetch";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function ProjectMetrics() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, loading] = useQuery<any>(`project-${id}`, `/project/${id}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Placeholder data for metrics
  const trafficChartOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    colors: ['#465fff'],
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false },
    grid: { show: false },
    theme: { mode: 'dark' }
  };

  const trafficChartSeries = [{ name: 'Requests', data: [31, 40, 28, 51, 42, 109, 100] }];

  return (
    <div className="w-full">
      <PageMeta title={`${project?.name || 'Project'} | Metrics`} description="Project performance metrics and analytics." />
      <PageBreadcrumb pageTitle="Project Metrics" />
      
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 transition-all duration-300">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/projects')}
              className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Performance Analytics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {project?.name} - Real-time statistics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Total Traffic" value="1.2M" sub="↑ 12%" icon={<BoltIcon className="size-6" />} color="text-brand-500" />
            <MetricCard title="Active Users" value="42.5K" sub="↑ 5.4%" icon={<GroupIcon className="size-6" />} color="text-success-500" />
            <MetricCard title="Avg Latency" value="142ms" sub="↓ 2ms" icon={<PieChartIcon className="size-6" />} color="text-orange-500" />
            <MetricCard title="Errors" value="0.04%" sub="Normal" icon={<BoltIcon className="size-6" />} color="text-error-500" />
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-gray-800 dark:text-white/90">Request Volume</h4>
              <span className="text-xs font-bold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                <ArrowUpIcon className="size-3" /> Latest Window
              </span>
            </div>
            <Chart options={trafficChartOptions} series={trafficChartSeries} type="area" height={350} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, icon, color }: any) {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 shadow-sm transition-all hover:shadow-md">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-end gap-2">
          <h4 className="text-2xl font-black text-gray-800 dark:text-white">{value}</h4>
          <span className="text-xs font-bold text-success-500 mb-1">{sub}</span>
        </div>
      </div>
    </div>
  );
}
