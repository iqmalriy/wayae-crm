import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/components/ui/data-table";
import type { CustomerOrganizationView } from "../types/response-types";
import { formatRelativeTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { EyeIcon } from "lucide-react";

const columnHelper = createColumnHelper<
  DataTableFeatures,
  CustomerOrganizationView
>();

const statusVariants: Record<
  CustomerOrganizationView["status"],
  "secondary" | "default" | "destructive"
> = {
  prospect: "secondary",
  active: "default",
  churned: "destructive",
};

export function buildColumns() {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.legalName ? (
            <span className="text-xs text-muted-foreground">
              {row.original.legalName}
            </span>
          ) : null}
        </div>
      ),
    }),
    columnHelper.accessor("organizationType", {
      id: "organizationType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const value = row.original.organizationType;
        return value ? (
          <span className="capitalize">{value}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const value = row.original.status;
        return (
          <Badge
            variant={statusVariants[value]}
            className={cn(value === "active" && "bg-emerald-500")}
          >
            <span className="capitalize">{value}</span>
          </Badge>
        );
      },
    }),
    columnHelper.accessor("customerCount", {
      id: "customerCount",
      header: () => <span>Customers</span>,
      cell: ({ row }) => row.original.customerCount,
    }),
    columnHelper.accessor("activeCustomerCount", {
      id: "activeCustomerCount",
      header: () => <span>Active</span>,
      cell: ({ row }) => row.original.activeCustomerCount,
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => formatRelativeTime(row.original.updatedAt),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={`/p/customer-organizations/${row.original.id}`}
              />
            }
          >
            <EyeIcon />
            Detail
          </Button>
        </div>
      ),
    }),
  ]);
}