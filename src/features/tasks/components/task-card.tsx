"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  CalendarClockIcon,
  GripHorizontalIcon,
  UserRoundIcon,
} from "lucide-react";
import type { TaskPriority } from "@/lib/db/schema";
import type { TaskView } from "../types/response-types";
import { cn } from "@/lib/utils";

const priorityMeta: Record<
  TaskPriority,
  { variant: "secondary" | "outline" | "default" }
> = {
  low: { variant: "secondary" },
  medium: { variant: "outline" },
  high: { variant: "default" },
};

function formatDueDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export function TaskCardView({
  task,
  dragHandle,
  onClick,
}: {
  task: TaskView;
  dragHandle?: ReactNode;
  onClick?: () => void;
}) {
  const isOverdue =
    task.dueAt && task.status !== "done" && new Date(task.dueAt) < new Date();

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm",
        onClick &&
          "cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/40",
      )}
    >
      {dragHandle ? (
        <div className="-mt-1.5 flex items-center justify-center">{dragHandle}</div>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <Badge variant={priorityMeta[task.priority].variant} className="capitalize">
          {task.priority}
        </Badge>
        {task.dueAt ? (
          <span
            className={cn(
              "flex items-center gap-1 text-xs text-muted-foreground",
              isOverdue && "font-medium text-destructive",
            )}
          >
            <CalendarClockIcon className="size-3" />
            {formatDueDate(task.dueAt)}
          </span>
        ) : null}
      </div>

      <p className="text-sm leading-snug font-medium">{task.title}</p>
      {task.description ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
        <Link
          href={`/p/leads/${task.leadId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 font-mono hover:text-foreground hover:underline"
          title={task.leadName ?? undefined}
        >
          {task.leadNumber ?? "—"}
        </Link>
        <span className="flex min-w-0 items-center gap-1">
          <UserRoundIcon className="size-3 shrink-0" />
          <span className="truncate">{task.assigneeName ?? "Unassigned"}</span>
        </span>
      </div>
    </div>
  );
}

export function SortableTaskCard({
  task,
  onOpen,
}: {
  task: TaskView;
  onOpen?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-40")}
    >
      <TaskCardView
        task={task}
        onClick={onOpen}
        dragHandle={
          <button
            type="button"
            aria-label="Drag to move task"
            className="flex cursor-grab touch-none items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripHorizontalIcon className="size-4" />
          </button>
        }
      />
    </div>
  );
}
