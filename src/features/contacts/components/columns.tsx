import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader, type DataTableFeatures } from "@/components/ui/data-table";
import type { ContactView } from "../types/response-types";
import { formatRelativeTime } from "@/lib/datetime";
import { EyeIcon, Link2Icon } from "lucide-react";
import { DetachContactFromCustomerDialog } from "./detach-contact-from-customer-dialog";

const columnHelper = createColumnHelper<DataTableFeatures, ContactView>();

export function buildColumns(options?: { showDetach?: boolean }) {
  const showDetach = options?.showDetach ?? false;
  return columnHelper.columns([
    columnHelper.accessor("displayName", {
      id: "displayName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const contact = row.original;
        if (contact.costumers) {
          return (
            <Link
              href={`/p/customers/${contact.costumers.id}`}
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Link2Icon className="size-3.5" />
              {contact.costumers.fullName}
            </Link>
          );
        }
        return contact.displayName;
      },
    }),
    columnHelper.accessor("phone", {
      id: "phoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
    }),
    columnHelper.accessor("source", {
      id: "source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.source === "inbound" ? "secondary" : "outline"}>
          {row.original.source}
        </Badge>
      ),
    }),
    columnHelper.accessor("firstSeenAt", {
      id: "firstSeenAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="First seen" />
      ),
      cell: ({ row }) => formatRelativeTime(row.original.firstSeenAt),
    }),
    columnHelper.accessor("lastSeenAt", {
      id: "lastSeenAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last seen" />
      ),
      cell: ({ row }) => formatRelativeTime(row.original.lastSeenAt),
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => formatRelativeTime(row.original.createdAt),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {showDetach && row.original.costumers && row.original.canDetach ? (
            <DetachContactFromCustomerDialog
              contactId={row.original.id}
              contactName={row.original.displayName}
            />
          ) : null}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/p/contacts/${row.original.id}`} />}
          >
            <EyeIcon />
            Detail
          </Button>
        </div>
      ),
    }),
  ]);
}