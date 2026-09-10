"use client"

import * as React from "react"
import {
  useTable,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { dataTableFeatures, type DataTableFeatures } from "./data-table-features"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  isLoading?: boolean
  loadingRows?: number
  toolbar?: React.ReactNode
  emptyMessage?: string
  onRowClick?: (row: TData) => void

  /** Server-side pagination: the table stops slicing data itself. Pass the
   *  current page as `data`, plus `rowCount`/`pageCount` and controlled
   *  `pagination`/`onPaginationChange`. */
  manualPagination?: boolean
  rowCount?: number
  pageCount?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>

  /** Server-side sorting. */
  manualSorting?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>

  /** Server-side column filtering. */
  manualFiltering?: boolean
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  loadingRows = 5,
  toolbar,
  emptyMessage = "No results.",
  onRowClick,

  manualPagination = false,
  rowCount,
  pageCount,
  pagination: paginationProp,
  onPaginationChange: onPaginationChangeProp,

  manualSorting = false,
  sorting: sortingProp,
  onSortingChange: onSortingChangeProp,

  manualFiltering = false,
  columnFilters: columnFiltersProp,
  onColumnFiltersChange: onColumnFiltersChangeProp,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const sorting = manualSorting ? (sortingProp ?? []) : internalSorting
  const columnFilters = manualFiltering
    ? (columnFiltersProp ?? [])
    : internalColumnFilters
  const pagination = manualPagination
    ? (paginationProp ?? { pageIndex: 0, pageSize: 10 })
    : internalPagination

  const handleSortingChange = React.useCallback(
    (updater: Updater<SortingState>) => {
      if (manualSorting && onSortingChangeProp) onSortingChangeProp(updater)
      else setInternalSorting(updater)
    },
    [manualSorting, onSortingChangeProp]
  )

  const handleColumnFiltersChange = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      if (manualFiltering && onColumnFiltersChangeProp)
        onColumnFiltersChangeProp(updater)
      else setInternalColumnFilters(updater)
    },
    [manualFiltering, onColumnFiltersChangeProp]
  )

  const handlePaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      if (manualPagination && onPaginationChangeProp)
        onPaginationChangeProp(updater)
      else setInternalPagination(updater)
    },
    [manualPagination, onPaginationChangeProp]
  )

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount,
    pageCount,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onPaginationChange: handlePaginationChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      pagination,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      {toolbar ? <div className="flex items-center py-4">{toolbar}</div> : null}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {table.getVisibleFlatColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length || 1}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading ? <DataTablePagination table={table} /> : null}
    </div>
  )
}

export { dataTableFeatures, type DataTableFeatures }
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTablePagination } from "./data-table-pagination"
export { DataTableViewOptions } from "./data-table-view-options"