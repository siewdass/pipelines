import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

export type { ColumnDef };

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  className?: string;
}

export function DataTable<TData>({
  data,
  columns,
  className = '',
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}>
      <div className="max-w-full overflow-x-auto">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="flex">
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 flex-1"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {table.getRowModel().rows.map((row) => (
            <div key={row.id} className="flex hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
              {row.getVisibleCells().map((cell) => (
                <div
                  key={cell.id}
                  className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400 flex-1 flex items-center"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
