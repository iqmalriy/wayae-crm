import {
  listTasksHandler,
  createTaskHandler,
} from "@/features/tasks";

export const GET = listTasksHandler;
export const POST = createTaskHandler;