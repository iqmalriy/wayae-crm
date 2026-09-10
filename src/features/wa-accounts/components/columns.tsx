import { createColumnHelper } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/components/ui/data-table";
import type { WaAccountListItem } from "../types/response-types";
import { formatRelativeTime } from "@/lib/datetime";
import { UpdateWaAccountLabelDialog } from "./update-wa-account-label-dialog";
import { RefreshWaAccountTokenDialog } from "./refresh-wa-account-token-dialog";
import { DeleteWaAccountDialog } from "./delete-wa-account-dialog";
import { HeartbeatActivityDialog } from "@/features/wa-heartbeat/components/heartbeat-activity-dialog";

const columnHelper = createColumnHelper<DataTableFeatures, WaAccountListItem>();

export function buildColumns(canManage: boolean) {
  return columnHelper.columns([
    columnHelper.accessor("label", {
      id: "label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Label" />
      ),
    }),
    columnHelper.accessor("phone", {
      id: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
    }),
    columnHelper.accessor("user.name", {
      id: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner" />
      ),
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? (
          <div className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.accessor("lastHeartbeatAt", {
      id: "lastHeartbeatAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last heartbeat" />
      ),
      cell: ({ row }) => {
        const value = row.original.lastHeartbeatAt;
        if (!value) return <span className="text-muted-foreground">—</span>;
        return <Badge variant="secondary">{formatRelativeTime(value)}</Badge>;
      },
    }),
    columnHelper.accessor("lastHeartbeatAt", {
      id: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const value = row.original.lastHeartbeatAt;
        const offline =
          !value || Date.now() - new Date(value).getTime() > 3 * 60 * 1000;
        return (
          <Badge variant={offline ? "destructive" : "secondary"}>
            {offline ? "Offline" : "Online"}
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
                <HeartbeatActivityDialog
                  id={row.original.id}
                  label={row.original.label}
                  phone={row.original.phone}
                />
                <UpdateWaAccountLabelDialog
                  id={row.original.id}
                  label={row.original.label}
                />
                <RefreshWaAccountTokenDialog
                  id={row.original.id}
                  phone={row.original.phone}
                />
                <DeleteWaAccountDialog
                  id={row.original.id}
                  label={row.original.label}
                  phone={row.original.phone}
                />
              </div>
            ),
          }),
        ]
      : []),
  ]);
}