"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarClockIcon,
  CircleCheckBigIcon,
  CircleDotIcon,
  ListTodoIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";
import type { TaskStatus } from "@/lib/db/schema";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useGetTask } from "../queries/get-task";
import { EditTaskDialog } from "./edit-task-dialog";

const statusMeta: Record<
  TaskStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  todo: { label: "To do", icon: ListTodoIcon, className: "text-muted-foreground" },
  in_progress: { label: "In progress", icon: CircleDotIcon, className: "text-sky-500" },
  done: { label: "Done", icon: CircleCheckBigIcon, className: "text-emerald-500" },
};

const priorityVariant: Record<
  string,
  "secondary" | "outline" | "default"
> = {
  low: "secondary",
  medium: "outline",
  high: "default",
};

function formatDateTime(value: string): string {
  return format(new Date(value), "d MMM yyyy, HH:mm");
}

function formatDue(value: string): string {
  return format(new Date(value), "d MMM yyyy");
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  const Icon = icon;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="truncate">{value}</div>
      </div>
    </div>
  );
}

export function TaskDetailDialog({
  taskId,
  open,
  onOpenChange,
}: {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isPending } = useGetTask(taskId ?? undefined);
  const task = data?.task;

  const { data: sessionData } = authClient.useSession();
  const isAdmin = sessionData?.user?.role === "admin";
  const canEdit =
    !!task && (isAdmin || task.assignee?.id === sessionData?.user?.id);
  const [editOpen, setEditOpen] = useState(false);

  const isOverdue =
    task?.dueAt &&
    task.status !== "done" &&
    new Date(task.dueAt) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {isPending || !task ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : (
            <>
              <DialogTitle className="pr-8">{task.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 capitalize">
                  <Badge variant={priorityVariant[task.priority]}>
                    {task.priority}
                  </Badge>
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1",
                    statusMeta[task.status].className,
                  )}
                >
                  {(() => {
                    const Icon = statusMeta[task.status].icon;
                    return <Icon className="size-4" />;
                  })()}
                  {statusMeta[task.status].label}
                </span>
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {isPending || !task ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <>
            {task.description ? (
              <p className="whitespace-pre-wrap text-sm text-foreground/90">
                {task.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No description.</p>
            )}

            <div className="grid gap-3 border-t pt-3 sm:grid-cols-2">
              <MetaItem
                icon={CalendarClockIcon}
                label="Due date"
                value={
                  task.dueAt ? (
                    <span className={cn(isOverdue && "font-medium text-destructive")}>
                      {formatDue(task.dueAt)}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <MetaItem
                icon={UserRoundIcon}
                label="Assignee"
                value={task.assignee ? task.assignee.name : "Unassigned"}
              />
              <MetaItem
                icon={ListTodoIcon}
                label="Created by"
                value={task.createdBy ? task.createdBy.name : "—"}
              />
              <MetaItem
                icon={CalendarClockIcon}
                label="Created at"
                value={formatDateTime(task.createdAt)}
              />
              {task.completedAt ? (
                <MetaItem
                  icon={CircleCheckBigIcon}
                  label="Completed at"
                  value={formatDateTime(task.completedAt)}
                />
              ) : null}
              {task.lead ? (
                <MetaItem
                  icon={CircleDotIcon}
                  label="Lead"
                  value={
                    <Link
                      href={`/p/leads/${task.lead.id}`}
                      className="font-mono text-foreground hover:underline"
                    >
                      {task.lead.number ?? task.lead.name ?? task.lead.id}
                    </Link>
                  }
                />
              ) : null}
            </div>
          </>
        )}

        <DialogFooter>
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {canEdit ? (
              <Button onClick={() => setEditOpen(true)}>Edit task</Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>

      <EditTaskDialog
        task={task ?? null}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Dialog>
  );
}
