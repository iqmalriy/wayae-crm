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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useListCustomerOrganizations } from "../queries/list-customer-organization";
import { buildColumns } from "./columns";
import { CreateCustomerOrganizationDialog } from "./create-customer-organization-dialog";
import { useBreadcrumb } from "@/components/breadcrumb-global";

type TypeFilter = "" | "enterprise" | "individual";
type StatusFilter = "" | "prospect" | "active" | "churned";

interface OrganizationsToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  type: TypeFilter;
  onTypeChange: (value: TypeFilter) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  isFetching: boolean;
}

function OrganizationsToolbar({
  searchInput,
  onSearchChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  isFetching,
}: OrganizationsToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or legal name..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <Select
          value={type}
          onValueChange={(v) => onTypeChange(v as TypeFilter)}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              <span className="text-muted-foreground">All types</span>
            </SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
          </SelectContent>
        </Select>
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
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
        <span className="flex items-center gap-2 text-sm text-muted-foreground sm:ml-auto">
          {isFetching ? "Refreshing..." : null}
        </span>
      </div>
    </div>
  );
}

export function CustomerOrganizationsPage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Customer Organizations" },
    ]);
  }, [setItems]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [searchInput, setSearchInput] = useState("");
  const searchValue = useDebounce(searchInput, 300);
  const [type, setType] = useState<TypeFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");

  const { data, isPending, isFetching } = useListCustomerOrganizations({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    search: searchValue || undefined,
    type: type || undefined,
    status: status || undefined,
    sortBy: (sorting[0]?.id as
      | "name"
      | "status"
      | "organizationType"
      | "updatedAt") ?? "updatedAt",
    sortDir: sorting[0]?.desc ? "desc" : "asc",
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Customer Organizations
          </h1>
          <p className="text-muted-foreground">
            View the companies and accounts you manage across your CRM.
          </p>
        </div>
        <CreateCustomerOrganizationDialog />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All organizations</CardTitle>
            <CardDescription>
              Search, filter, sort, and paginate through your customer
              organizations.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={buildColumns()}
            data={data?.customerOrganizations ?? []}
            isLoading={isPending}
            rowCount={data?.total}
            manualPagination
            pagination={pagination}
            onPaginationChange={setPagination}
            manualSorting
            sorting={sorting}
            onSortingChange={setSorting}
            toolbar={
              <OrganizationsToolbar
                searchInput={searchInput}
                onSearchChange={(value) => {
                  setSearchInput(value);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                type={type}
                onTypeChange={(value) => {
                  setType(value);
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
            emptyMessage="No customer organizations found."
          />
        </CardContent>
      </Card>
    </div>
  );
}