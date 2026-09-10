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
import { useListCustomers } from "../queries/list-customer";
import { buildColumns } from "./customer-columns";

type StatusFilter = "" | "active" | "inactive";

interface CustomersTableProps {
  organizationId?: string;
  showDetach?: boolean;
}

interface CustomersToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  isFetching: boolean;
}

function CustomersToolbar({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  isFetching,
}: CustomersToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or job title..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <Select
          value={status}
          onValueChange={(v) => onStatusChange(v as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              <span className="text-muted-foreground">All statuses</span>
            </SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <span className="flex items-center gap-2 text-sm text-muted-foreground sm:ml-auto">
          {isFetching ? "Refreshing..." : null}
        </span>
      </div>
    </div>
  );
}

export function CustomersTable({ organizationId, showDetach }: CustomersTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [searchInput, setSearchInput] = useState("");
  const searchValue = useDebounce(searchInput, 300);
  const [status, setStatus] = useState<StatusFilter>("");

  const { data, isPending, isFetching } = useListCustomers({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: searchValue || undefined,
    organizationId: organizationId || undefined,
    status: status || undefined,
    sortBy: (sorting[0]?.id as
      | "fullName"
      | "email"
      | "status"
      | "createdAt"
      | "updatedAt") ?? "updatedAt",
    sortDir: sorting[0]?.desc ? "desc" : "asc",
  });

  return (
    <DataTable
      columns={buildColumns({ showDetach })}
      data={data?.customers ?? []}
      isLoading={isPending}
      rowCount={data?.total}
      manualPagination
      pagination={pagination}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      toolbar={
        <CustomersToolbar
          searchInput={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          isFetching={isFetching}
        />
      }
      emptyMessage="No customers found."
    />
  );
}