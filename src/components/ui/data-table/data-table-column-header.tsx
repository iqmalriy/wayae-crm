"use client"

import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, EyeOffIcon } from "lucide-react"
import type { Column, RowData } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { DataTableFeatures } from "./data-table-features"

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) {
    return <span className={cn("text-sm", className)}>{title}</span>
  }

  const sorted = column.getIsSorted()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {sorted === "desc" ? (
              <ArrowDownIcon className="ml-2 size-4" />
            ) : sorted === "asc" ? (
              <ArrowUpIcon className="ml-2 size-4" />
            ) : (
              <ChevronsUpDownIcon className="ml-2 size-4" />
            )}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-40">
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => column.toggleSorting(false)}
          >
            <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" />
            Asc
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => column.toggleSorting(true)}
          >
            <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" />
            Desc
          </Button>
          {column.getCanHide() ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => column.toggleVisibility(false)}
            >
              <EyeOffIcon className="mr-2 size-3.5 text-muted-foreground/70" />
              Hide
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}