"use client";

import { useEffect, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useListUsers } from "../queries/list-user";
import { CreateUserDialog } from "./create-user-dialog";
import { buildColumns } from "./columns";
import { useBreadcrumb } from "@/components/breadcrumb-global";
import { useRole } from "@/hooks/use-role";

export function UsersPage() {
  const { setItems } = useBreadcrumb();
  const { can } = useRole();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Users" },
    ]);
  }, [setItems]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [searchInput, setSearchInput] = useState("");
  const searchValue = useDebounce(searchInput, 300);

  const { data, isPending, isFetching } = useListUsers({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: searchValue || undefined,
    sortBy: (sorting[0]?.id as "name" | "email" | "role" | "createdAt") ?? "createdAt",
    sortDir: sorting[0]?.desc ? "desc" : "asc",
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage the people who can access your workspace.
          </p>
        </div>
        {can("admin") && <CreateUserDialog />}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All users</CardTitle>
            <CardDescription>
              Search, sort, and paginate through your users.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={buildColumns(can("admin"))}
            data={data?.users ?? []}
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
                    placeholder="Search users by name or email..."
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
            emptyMessage="No users found."
          />
        </CardContent>
      </Card>
    </div>
  );
}