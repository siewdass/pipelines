import * as React from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  ColumnDef,
  Row,
  HeaderGroup,
  Cell,
  Header
} from '@tanstack/react-table';

export type { ColumnDef, Row, HeaderGroup, Cell, Header };
export { flexRender };

export interface TableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  getRowId?: (row: TData) => string;
}

/**
 * useTable hook
 * Exposes the full TanStack Table instance for custom logic
 */
export function useTable<TData>({ data, columns, getRowId }: TableOptions<TData>) {
  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });
}

/**
 * Headless Flex/Grid Component (Div-based only)
 * This component is 100% style-agnostic. 
 * Use it for both "Table look-alike" (horizontal rows) or "Grid look-alike" (cards).
 */
export interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  renderHeaderGroup?: (headerGroup: HeaderGroup<TData>) => React.ReactNode;
  renderHeader?: (header: Header<TData, any>) => React.ReactNode;
  renderRow?: (row: Row<TData>) => React.ReactNode;
  renderCell?: (cell: Cell<TData, any>) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DataGrid<TData>({
  data,
  columns,
  renderHeaderGroup,
  renderHeader,
  renderRow,
  renderCell,
  className = '',
  style
}: DataGridProps<TData>) {
  const table = useTable({ data, columns });

  return (
    <div className={className} style={style}>
      {/* 1. Headers Section */}
      <div className="grid-header-container">
        {table.getHeaderGroups().map(headerGroup => (
          renderHeaderGroup ? renderHeaderGroup(headerGroup) : (
            <div key={headerGroup.id} className="grid-header-group">
              {headerGroup.headers.map(header => (
                <div key={header.id} className="grid-header-cell">
                  {renderHeader ? renderHeader(header) : (
                    header.isPlaceholder 
                      ? null 
                      : flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      {/* 2. Body Section */}
      <div className="grid-body-container">
        {table.getRowModel().rows.map(row => (
          renderRow ? renderRow(row) : (
            <div key={row.id} className="grid-row">
              {row.getVisibleCells().map(cell => (
                <div key={cell.id} className="grid-cell">
                  {renderCell ? renderCell(cell) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
