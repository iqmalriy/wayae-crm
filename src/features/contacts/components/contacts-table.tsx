"use client";

import { useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useListContacts } from "../queries/list-contact";
import { buildColumns } from "./columns";

interface ContactsTableProps {
  customerId?: string;
  showDetach?: boolean;
}

export function ContactsTable({ customerId, showDetach }: ContactsTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [searchInput, setSearchInput] = useState("");
  const searchValue = useDebounce(searchInput, 300);

  const { data, isPending, isFetching } = useListContacts({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: searchValue || undefined,
    customerId: customerId || undefined,
    sortBy: (sorting[0]?.id as
      | "displayName"
      | "phoneNumber"
      | "source"
      | "createdAt"
      | "lastSeenAt") ?? "createdAt",
    sortDir: sorting[0]?.desc ? "desc" : "asc",
  });

  return (
    <DataTable
      columns={buildColumns({ showDetach })}
      data={data?.contacts ?? []}
      isLoading={isPending}
      rowCount={data?.total}
      manualPagination
      pagination={pagination}
      onPaginationChange={setPagination}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      toolbar={
        <>
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name or phone..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              className="pl-8"
            />
          </div>
          <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            {isFetching ? "Refreshing..." : null}
          </span>
        </>
      }
      emptyMessage="No contacts found."
    />
  );
}