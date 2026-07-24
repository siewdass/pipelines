import { ReactNode } from "react";

interface DataGridProps<TData> {
  data: TData[];
  renderItem: (item: TData) => ReactNode;
  className?: string;
}

export function DataGrid<TData>({
  data,
  renderItem,
  className = '',
}: DataGridProps<TData>) {
  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${className}`}>
      {data.map((item, index) => (
        <div key={index}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
