"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useListWaAccounts } from "../queries/list-wa-account";
import { CreateWaAccountDialog } from "./create-wa-account-dialog";
import { buildColumns } from "./columns";
import { useBreadcrumb } from "@/components/breadcrumb-global";
import { useRole } from "@/hooks/use-role";

export function WaAccountsPage() {
  const { setItems } = useBreadcrumb();
  const { can } = useRole();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "WhatsApp Accounts" },
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

  const canManage = can("admin");
  const columns = useMemo(() => buildColumns(canManage), [canManage]);

  const { data, isPending, isFetching } = useListWaAccounts({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: searchValue || undefined,
    sortBy:
      (sorting[0]?.id as
        | "phone"
        | "label"
        | "createdAt"
        | "userName") ?? "createdAt",
    sortDir: sorting[0]?.desc ? "desc" : "asc",
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            WhatsApp Accounts
          </h1>
          <p className="text-muted-foreground">
            Manage WhatsApp accounts and their bearer tokens.
          </p>
        </div>
        {can("admin") && <CreateWaAccountDialog />}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All accounts</CardTitle>
            <CardDescription>
              Search, sort, and paginate through your WhatsApp accounts.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.waAccounts ?? []}
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
                    placeholder="Search by label or phone..."
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
            emptyMessage="No WhatsApp accounts found."
          />
        </CardContent>
      </Card>
    </div>
  );
}