import Badge from "../ui/badge/Badge";

interface ProjectCardProps {
  name: string;
  description?: string;
  status: string;
  price: string;
  image?: string;
  category: string;
}

export function ProjectCard({ name, description, status, price, image, category }: ProjectCardProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border border-gray-200 rounded-2xl dark:border-white/[0.05] dark:bg-white/[0.03] transition-all hover:shadow-theme-md">
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img src={image} alt={name} className="object-cover w-full h-full" />
          <div className="absolute top-3 right-3">
            <Badge 
              size="sm"
              color={
                status === "Delivered" || status === "Completed"
                  ? "success"
                  : status === "Pending" || status === "In Progress"
                  ? "warning"
                  : "error"
              }
            >
              {status}
            </Badge>
          </div>
        </div>
      )}
      
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-theme-xs font-semibold uppercase tracking-wider text-brand-500 mb-1 block">
              {category}
            </span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 line-clamp-1">
              {name}
            </h3>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {price}
          </span>
        </div>
        
        {description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">
            {description}
          </p>
        )}
        
        <div className="pt-4 mt-auto border-t border-gray-100 dark:border-white/[0.05]">
          <button className="w-full py-2 text-sm font-medium transition-colors rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.08] dark:hover:text-gray-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
