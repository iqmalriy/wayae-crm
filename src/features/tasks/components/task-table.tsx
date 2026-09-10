"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFeatures } from "@/components/ui/data-table";
import {
  CircleCheckBigIcon,
  CircleDotIcon,
  ListTodoIcon,
  type LucideIcon,
} from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/lib/db/schema";
import type { TaskView } from "../types/response-types";
import { useListLeadTasks } from "../queries/list-lead-tasks";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<DataTableFeatures, TaskView>();

const statusMeta: Record<
  TaskStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  todo: { label: "To do", icon: ListTodoIcon, className: "text-muted-foreground" },
  in_progress: { label: "In progress", icon: CircleDotIcon, className: "text-sky-500" },
  done: { label: "Done", icon: CircleCheckBigIcon, className: "text-emerald-500" },
};

const priorityVariant: Record<
  TaskPriority,
  "secondary" | "outline" | "default"
> = {
  low: "secondary",
  medium: "outline",
  high: "default",
};

function formatDate(value: string): string {
  return format(new Date(value), "d MMM yyyy");
}

function buildColumns() {
  return columnHelper.columns([
    columnHelper.accessor("title", {
      id: "title",
      header: () => <span>Title</span>,
      cell: ({ row }) => {
        const isOverdue =
          row.original.dueAt &&
          row.original.status !== "done" &&
          new Date(row.original.dueAt) < new Date();
        return (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{row.original.title}</span>
            {row.original.description ? (
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {row.original.description}
              </span>
            ) : null}
            {isOverdue ? (
              <span className="text-xs font-medium text-destructive">Overdue</span>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => <span>Status</span>,
      cell: ({ row }) => {
        const meta = statusMeta[row.original.status];
        const Icon = meta.icon;
        return (
          <span className={cn("flex items-center gap-1.5", meta.className)}>
            <Icon className="size-4" />
            <span className="capitalize">{meta.label}</span>
          </span>
        );
      },
    }),
    columnHelper.accessor("priority", {
      id: "priority",
      header: () => <span>Priority</span>,
      cell: ({ row }) => (
        <Badge
          variant={priorityVariant[row.original.priority]}
          className="capitalize"
        >
          {row.original.priority}
        </Badge>
      ),
    }),
    columnHelper.accessor("assigneeName", {
      id: "assigneeName",
      header: () => <span>Assignee</span>,
      cell: ({ row }) =>
        row.original.assigneeName ?? (
          <span className="text-muted-foreground">Unassigned</span>
        ),
    }),
    columnHelper.accessor("dueAt", {
      id: "dueAt",
      header: () => <span>Due date</span>,
      cell: ({ row }) =>
        row.original.dueAt ? formatDate(row.original.dueAt) : "—",
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: () => <span>Created</span>,
      cell: ({ row }) => formatDate(row.original.createdAt),
    }),
  ]);
}

export function TaskTable({ leadId }: { leadId: string }) {
  const { data, isPending } = useListLeadTasks(leadId);

  return (
    <DataTable
      columns={buildColumns()}
      data={data?.tasks ?? []}
      isLoading={isPending}
      emptyMessage="No tasks for this lead."
    />
  );
}