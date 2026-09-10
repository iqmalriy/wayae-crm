import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/components/ui/data-table";
import type { CustomerView } from "../types/response-types";
import { formatRelativeTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { EyeIcon, CrownIcon, StarIcon } from "lucide-react";
import { DetachCustomerFromOrganizationDialog } from "./detach-customer-from-organization-dialog";

const columnHelper = createColumnHelper<DataTableFeatures, CustomerView>();

const statusVariants: Record<
  CustomerView["status"],
  "secondary" | "default" | "destructive"
> = {
  active: "default",
  inactive: "secondary",
};

export function buildColumns(options?: { showDetach?: boolean }) {
  const showDetach = options?.showDetach ?? false;
  return columnHelper.columns([
    columnHelper.accessor("fullName", {
      id: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="flex items-center gap-1.5 font-medium">
            {row.original.fullName}
            {row.original.isDecisionMaker && (
              <CrownIcon className="size-4 text-amber-500" />
            )}
            {row.original.isPrimaryContact && (
              <StarIcon className="size-4 text-amber-500" />
            )}
          </span>
          {row.original.organizationName ? (
            <span className="text-xs text-muted-foreground">
              {row.original.organizationName}
            </span>
          ) : null}
        </div>
      ),
    }),
    columnHelper.accessor("jobTitle", {
      id: "jobTitle",
      header: () => <span>Job Title</span>,
      cell: ({ row }) =>
        row.original.jobTitle ? (
          <span>{row.original.jobTitle}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
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
        <div className="flex items-center justify-end gap-2">
          {showDetach && row.original.canDetach ? (
            <DetachCustomerFromOrganizationDialog
              customerId={row.original.id}
              customerName={row.original.fullName}
            />
          ) : null}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/p/customers/${row.original.id}`} />}
          >
            <EyeIcon />
            Detail
          </Button>
        </div>
      ),
    }),
  ]);
}