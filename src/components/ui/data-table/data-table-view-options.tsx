"use client"

import { CheckIcon, Columns3Icon } from "lucide-react"
import type { ReactTable, RowData } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { DataTableFeatures } from "./data-table-features"

interface DataTableViewOptionsProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>
}

export function DataTableViewOptions<TData extends RowData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="ml-auto">
            <Columns3Icon />
            View
          </Button>
        }
      />
      <PopoverContent align="end" className="w-52 p-1.5">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Toggle columns
        </div>
        <div className="flex flex-col gap-0.5">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              const label =
                typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id
              return (
                <button
                  key={column.id}
                  type="button"
                  onClick={() => column.toggleVisibility(!column.getIsVisible())}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="capitalize">{label}</span>
                  <CheckIcon
                    className={cn(
                      "size-4",
                      column.getIsVisible()
                        ? "text-primary"
                        : "text-transparent",
                    )}
                  />
                </button>
              )
            })}
        </div>
      </PopoverContent>
    </Popover>
  )
}