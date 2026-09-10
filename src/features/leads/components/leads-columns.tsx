import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/components/ui/data-table";
import type { LeadLead } from "../types/response-types";
import { formatRelativeTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<DataTableFeatures, LeadLead>();

const stageVariants: Record<
  LeadLead["stage"],
  "secondary" | "default" | "destructive" | "outline"
> = {
  new: "secondary",
  contacted: "default",
  qualified: "outline",
  proposal: "default",
  won: "default",
  lost: "destructive",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function buildColumns() {
  return columnHelper.columns([
    columnHelper.accessor("leadNumber", {
      id: "leadNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.leadNumber}
        </span>
      ),
    }),
    columnHelper.accessor("costumer.name", {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const { costumer, organization } = row.original;
        const value = costumer?.name ?? "—";
        return (
          <div className="flex flex-col">
            <span className="font-medium">{value}</span>
            <span className="text-xs text-muted-foreground">
              {costumer?.from ? (
                <span className="capitalize">
                  {costumer.from === "contact" ? "From contact" : costumer.from}
                </span>
              ) : (
                "Lead"
              )}
              {organization?.name ? ` · ${organization.name}` : null}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("contacts.phone", {
      id: "phone",
      header: () => <span>Phone</span>,
      cell: ({ row }) =>
        row.original.contacts?.phone ?? (
          <span className="text-muted-foreground">—</span>
        ),
    }),
    columnHelper.accessor("email.email", {
      id: "email",
      header: () => <span>Email</span>,
      cell: ({ row }) =>
        row.original.email?.email ?? (
          <span className="text-muted-foreground">—</span>
        ),
    }),
    columnHelper.accessor("stage", {
      id: "stage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stage" />
      ),
      cell: ({ row }) => {
        const value = row.original.stage;
        return (
          <Badge
            variant={stageVariants[value]}
            className={cn(
              value === "won" && "bg-emerald-500",
              value === "contacted" && "bg-sky-500",
            )}
          >
            <span className="capitalize">{value}</span>
          </Badge>
        );
      },
    }),
    columnHelper.accessor("ownerName", {
      id: "ownerId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner" />
      ),
      cell: ({ row }) =>
        row.original.ownerName ?? (
          <span className="text-muted-foreground">—</span>
        ),
    }),
    columnHelper.accessor("assigneeName", {
      id: "assigneeId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assignee" />
      ),
      cell: ({ row }) =>
        row.original.assigneeName ?? (
          <span className="text-muted-foreground">—</span>
        ),
    }),
    columnHelper.accessor("estimatedValue", {
      id: "estimatedValue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) =>
        row.original.estimatedValue != null ? (
          currencyFormatter.format(row.original.estimatedValue)
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    }),
    columnHelper.accessor("stageChangedAt", {
      id: "stageChangedAt",
      header: () => <span>Last stage change</span>,
      cell: ({ row }) => formatRelativeTime(row.original.stageChangedAt),
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
            render={<Link href={`/p/leads/${row.original.id}`} />}
          >
            <EyeIcon />
            <span>Detail</span>
          </Button>
        </div>
      ),
    }),
  ]);
}