"use client";

import { create } from "zustand";
import type { TaskView } from "../types/response-types";
import type { TaskStatus } from "@/lib/db/schema";

const emptyColumns: Record<TaskStatus, TaskView[]> = {
  todo: [],
  in_progress: [],
  done: [],
};

const emptyTotals: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 0,
  done: 0,
};

const emptyHasMore: Record<TaskStatus, boolean> = {
  todo: false,
  in_progress: false,
  done: false,
};

export interface TaskBoardState {
  columns: Record<TaskStatus, TaskView[]>;
  totals: Record<TaskStatus, number>;
  hasMore: Record<TaskStatus, boolean>;
  setStatusTasks: (
    status: TaskStatus,
    tasks: TaskView[],
    total: number,
    hasMore: boolean,
  ) => void;
  appendStatusTasks: (status: TaskStatus, tasks: TaskView[], hasMore: boolean) => void;
  moveTask: (
    from: TaskStatus,
    to: TaskStatus,
    activeId: string,
    overId?: string,
  ) => void;
  restoreColumns: (columns: Record<TaskStatus, TaskView[]>) => void;
}

export const useTaskBoardStore = create<TaskBoardState>((set, get) => ({
  columns: emptyColumns,
  totals: emptyTotals,
  hasMore: emptyHasMore,

  setStatusTasks: (status, tasks, total, hasMore) =>
    set((state) => ({
      columns: { ...state.columns, [status]: tasks },
      totals: { ...state.totals, [status]: total },
      hasMore: { ...state.hasMore, [status]: hasMore },
    })),

  appendStatusTasks: (status, tasks, hasMore) =>
    set((state) => {
      const existing = state.columns[status];
      const seen = new Set(existing.map((t) => t.id));
      const merged = [...existing, ...tasks.filter((t) => !seen.has(t.id))];
      return {
        columns: { ...state.columns, [status]: merged },
        hasMore: { ...state.hasMore, [status]: hasMore },
      };
    }),

  moveTask: (from, to, activeId, overId) => {
    const { columns, totals } = get();
    const task = columns[from].find((t) => t.id === activeId);
    if (!task) return;

    const updated: TaskView = {
      ...task,
      status: to,
      completedAt: to === "done" ? new Date().toISOString() : null,
    };

    const nextSource = columns[from].filter((t) => t.id !== activeId);
    const nextTarget = columns[to].filter((t) => t.id !== activeId);

    if (overId && overId !== activeId) {
      const index = nextTarget.findIndex((t) => t.id === overId);
      if (index >= 0) {
        nextTarget.splice(index, 0, updated);
      } else {
        nextTarget.push(updated);
      }
    } else {
      nextTarget.push(updated);
    }

    set({
      columns: {
        ...columns,
        [from]: nextSource,
        [to]: nextTarget,
      },
      totals:
        from === to
          ? totals
          : {
              ...totals,
              [from]: Math.max(0, totals[from] - 1),
              [to]: totals[to] + 1,
            },
    });
  },

  restoreColumns: (columns) => set({ columns }),
}));
