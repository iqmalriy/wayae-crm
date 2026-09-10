import { createColumnHelper } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader, type DataTableFeatures } from "@/components/ui/data-table";
import type { UserView } from "../types/response-types";
import { formatRelativeTime } from "@/lib/datetime";
import { UpdateUserDialog } from "./update-user-dialog";
import { DeleteUserButton } from "./delete-user-button";

const columnHelper = createColumnHelper<DataTableFeatures, UserView>();

export function buildColumns(canManage: boolean) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    }),
    columnHelper.accessor("role", {
      id: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => formatRelativeTime(row.original.createdAt),
    }),
    ...(canManage
      ? [
          columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
              <div className="flex items-center justify-end gap-1">
                <UpdateUserDialog user={row.original} />
                <DeleteUserButton user={row.original} />
              </div>
            ),
          }),
        ]
      : []),
  ]);
}