"use client";

import { useEffect } from "react";

import { CreateTaskDialog } from "./create-task-dialog";
import { TaskBoard } from "./task-board";
import { useBreadcrumb } from "@/components/breadcrumb-global";

export function TasksPage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Tasks" },
    ]);
  }, [setItems]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Kanban board of tasks, grouped by status. Drag cards to move them.
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      <TaskBoard />
    </div>
  );
}
