"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CircleCheckBigIcon,
  CircleDotIcon,
  ListTodoIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { TaskStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { TaskView } from "../types/response-types";
import { useListTasks } from "../queries/list-tasks";
import { useChangeTaskStatus } from "../queries/change-task-status";
import { useTaskBoardStore } from "../stores/task-board-store";
import { SortableTaskCard, TaskCardView } from "./task-card";
import { TaskDetailDialog } from "./task-detail-dialog";

const statuses: TaskStatus[] = ["todo", "in_progress", "done"];
const PAGE_SIZE = 50;

const columnMeta: Record<
  TaskStatus,
  { title: string; icon: LucideIcon; iconClassName: string }
> = {
  todo: { title: "To do", icon: ListTodoIcon, iconClassName: "text-muted-foreground" },
  in_progress: { title: "In progress", icon: CircleDotIcon, iconClassName: "text-sky-500" },
  done: { title: "Done", icon: CircleCheckBigIcon, iconClassName: "text-emerald-500" },
};

function findColumn(
  id: string,
  columns: Record<TaskStatus, TaskView[]>,
): TaskStatus | null {
  for (const status of statuses) {
    if (columns[status].some((task) => task.id === id)) return status;
  }
  return null;
}

function BoardColumn({
  status,
  isOver,
  onOpenTask,
}: {
  status: TaskStatus;
  isOver: boolean;
  onOpenTask: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const limit = PAGE_SIZE;

  const tasks = useTaskBoardStore((state) => state.columns[status]);
  const total = useTaskBoardStore((state) => state.totals[status]);
  const hasMore = useTaskBoardStore((state) => state.hasMore[status]);
  const setStatusTasks = useTaskBoardStore((state) => state.setStatusTasks);
  const appendStatusTasks = useTaskBoardStore((state) => state.appendStatusTasks);

  const { data, isPending } = useListTasks(status, { limit, offset });
  const { setNodeRef } = useDroppable({ id: status });

  useEffect(() => {
    if (!data) return;
    if (offset === 0) {
      setStatusTasks(status, data.tasks, data.total, data.hasMore);
    } else {
      appendStatusTasks(status, data.tasks, data.hasMore);
    }
  }, [data, offset, status, setStatusTasks, appendStatusTasks]);

  const meta = columnMeta[status];
  const Icon = meta.icon;
  const loadedAll = tasks.length >= total && total > 0;

  return (
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-64 flex-col gap-3 rounded-lg border bg-muted/40 p-3 transition-colors md:h-full",
          isOver && "border-primary/60 bg-primary/5 ring-1 ring-primary/30",
        )}
      >
      <div className="flex items-center gap-2 px-1">
        <Icon className={cn("size-4", meta.iconClassName)} />
        <span className="text-sm font-medium">{meta.title}</span>
        <Badge variant="secondary" className="ml-auto">
          {total}
        </Badge>
      </div>

      {isPending && tasks.length === 0 ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onOpen={() => onOpenTask(task.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-1 py-6">
              <p className="text-center text-sm text-muted-foreground">
                {isOver ? "Drop here" : "No tasks."}
              </p>
            </div>
          )}
        </SortableContext>
      )}

      {hasMore && !loadedAll ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOffset((prev) => prev + limit)}
          disabled={isPending}
        >
          {isPending ? "Loading..." : `Show more (${total - tasks.length} left)`}
        </Button>
      ) : null}
    </div>
  );
}

export function TaskBoard() {
  const queryClient = useQueryClient();

  const moveTask = useTaskBoardStore((state) => state.moveTask);
  const restoreColumns = useTaskBoardStore((state) => state.restoreColumns);

  const [activeTask, setActiveTask] = useState<TaskView | null>(null);
  const [dropColumn, setDropColumn] = useState<TaskStatus | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const dragStart = useRef<{ from: TaskStatus | null; snapshot: Record<TaskStatus, TaskView[]> } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const changeTaskStatus = useChangeTaskStatus({
    onError: (error) => {
      if (dragStart.current) {
        restoreColumns(dragStart.current.snapshot);
      }
      toast.add({
        title: "Failed to move task",
        description: error.message,
        type: "error",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const current = useTaskBoardStore.getState().columns;
    const from = findColumn(id, current);
    const task = from ? current[from].find((t) => t.id === id) : undefined;
    dragStart.current = {
      from,
      snapshot: JSON.parse(JSON.stringify(current)) as Record<TaskStatus, TaskView[]>,
    };
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const current = useTaskBoardStore.getState().columns;
    const from = findColumn(activeId, current);
    const overIsColumn = statuses.includes(overId as TaskStatus);
    const to = overIsColumn
      ? (overId as TaskStatus)
      : findColumn(overId, current);

    if (overIsColumn) setDropColumn(overId as TaskStatus);
    else if (to) setDropColumn(to);

    if (!from || !to) return;

    if (from === to) {
      const items = current[from];
      const oldIndex = items.findIndex((t) => t.id === activeId);
      const newIndex = items.findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex && newIndex >= 0) {
        useTaskBoardStore.setState((state) => ({
          columns: { ...state.columns, [from]: arrayMove(items, oldIndex, newIndex) },
        }));
      }
    } else {
      moveTask(from, to, activeId, overIsColumn ? undefined : overId);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDropColumn(null);

    if (!over) {
      if (dragStart.current) {
        restoreColumns(dragStart.current.snapshot);
      }
      setActiveTask(null);
      dragStart.current = null;
      return;
    }

    const activeId = String(active.id);
    const current = useTaskBoardStore.getState().columns;
    const to = findColumn(activeId, current);
    const from = dragStart.current?.from ?? null;

    setActiveTask(null);
    dragStart.current = null;

    if (from && to && from !== to) {
      changeTaskStatus.mutate({ id: activeId, input: { status: to } });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        if (dragStart.current) {
          restoreColumns(dragStart.current.snapshot);
        }
        setActiveTask(null);
        setDropColumn(null);
        dragStart.current = null;
      }}
    >
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] xl:grid-cols-3">
        {statuses.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            isOver={dropColumn === status}
            onOpenTask={setSelectedTaskId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 cursor-grabbing">
            <TaskCardView task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>

      <TaskDetailDialog
        taskId={selectedTaskId}
        open={selectedTaskId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
      />
    </DndContext>
  );
}
