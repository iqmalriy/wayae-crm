"use client";

import { useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useListLeads } from "../queries/list-lead";
import { leadStages } from "@/lib/db/schema";
import { buildColumns } from "./leads-columns";

type StageFilter = "" | (typeof leadStages)[number];

interface LeadsToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  stage: StageFilter;
  onStageChange: (value: StageFilter) => void;
  isFetching: boolean;
}

function LeadsToolbar({
  searchInput,
  onSearchChange,
  stage,
  onStageChange,
  isFetching,
}: LeadsToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, phone, or email..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <Select value={stage} onValueChange={(v) => onStageChange(v as StageFilter)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              <span className="text-muted-foreground">All stages</span>
            </SelectItem>
            {leadStages.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center gap-2 text-sm text-muted-foreground sm:ml-auto">
          {isFetching ? "Refreshing..." : null}
        </span>
      </div>
    </div>
  );
}

export function LeadsTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [searchInput, setSearchInput] = useState("");
  const searchValue = useDebounce(searchInput, 300);
  const [stage, setStage] = useState<StageFilter>("");

  const { data, isPending, isFetching } = useListLeads({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: searchValue || undefined,
    stage: stage || undefined,
    sortBy: (sorting[0]?.id as
      | "name"
      | "company"
      | "stage"
      | "ownerId"
      | "assigneeId"
      | "estimatedValue"
      | "createdAt") ?? "createdAt",
    sortDir: sorting[0]?.desc ? "desc" : "asc",
  });

  return (
    <DataTable
      columns={buildColumns()}
      data={data?.leads ?? []}
      isLoading={isPending}
      rowCount={data?.total}
      manualPagination
      pagination={pagination}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      toolbar={
        <LeadsToolbar
          searchInput={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          stage={stage}
          onStageChange={(value) => {
            setStage(value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          isFetching={isFetching}
        />
      }
      emptyMessage="No leads found."
    />
  );
}