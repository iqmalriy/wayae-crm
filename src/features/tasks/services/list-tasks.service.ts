import {
  countTasks,
  listTasks,
} from "../repositories/task.repository";
import type { ListTasksQuery } from "../schemas/list-tasks.schema";
import type { ListTasksOutput } from "../types/response-types";
import { toTaskView } from "./task-view";
import type { TaskActor } from "../types/actor";

export async function listTasksForUser(
  actor: TaskActor,
  query: ListTasksQuery,
): Promise<ListTasksOutput> {
  // Access is enforced server-side and cannot be bypassed via query params:
  // staff may only ever see tasks assigned to themselves; only admins may
  // scope by an arbitrary assignee.
  const isAdmin = actor.role === "admin";
  const assigneeId = isAdmin ? query.assigneeId : actor.userId;

  const values = {
    leadId: query.leadId,
    assigneeId,
    status: query.status,
    limit: query.limit,
    offset: query.offset,
  };

  const [rows, total] = await Promise.all([
    listTasks(values),
    countTasks({ leadId: query.leadId, assigneeId, status: query.status }),
  ]);

  const tasks = rows.map(toTaskView);

  return {
    tasks,
    total,
    hasMore: query.offset + tasks.length < total,
  };
}
