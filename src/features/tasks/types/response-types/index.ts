import type { TaskPriority, TaskStatus, LeadStage } from "@/lib/db/schema";

export interface TaskView {
  id: string;
  leadId: string;
  leadNumber: string | null;
  leadName: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  createdById: string | null;
  createdByName: string | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPersonView {
  id: string;
  name: string | null;
  email: string | null;
}

export interface TaskLeadView {
  id: string;
  number: string | null;
  name: string | null;
  stage: LeadStage | null;
}

export interface TaskDetailView {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead: TaskLeadView | null;
  assignee: TaskPersonView | null;
  createdBy: TaskPersonView | null;
}

export interface CreateTaskOutput {
  task: TaskView;
}

export interface GetTaskOutput {
  task: TaskDetailView;
}

export interface ChangeTaskStatusOutput {
  task: TaskView;
}

export interface UpdateTaskOutput {
  task: TaskView;
}

export interface ListTasksOutput {
  tasks: TaskView[];
  total: number;
  hasMore: boolean;
}