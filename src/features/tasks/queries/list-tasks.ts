"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { TaskStatus } from "@/lib/db/schema";
import type { ListTasksQuery } from "../schemas/list-tasks.schema";
import type { ListTasksOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListTasksOutput;
}

export type ListTasksQueryInput = Omit<
  ListTasksQuery,
  "status" | "limit" | "offset"
> & {
  limit?: number;
  offset?: number;
};

async function listTasksRequest(
  status: TaskStatus,
  query: ListTasksQueryInput,
): Promise<ListTasksOutput> {
  const searchParams = new URLSearchParams({ status });
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const response = await fetch(`/api/v1/tasks?${searchParams.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListTasksQueryKey = [string, TaskStatus, string | undefined, string | undefined, number, number];

export type ListTasksQueryOptions = UseQueryOptions<
  ListTasksOutput,
  AppError,
  ListTasksOutput,
  ListTasksQueryKey
>;

export function useListTasks(
  status: TaskStatus,
  query: ListTasksQueryInput = {},
  options?: Omit<ListTasksQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [
      "tasks",
      status,
      query.leadId,
      query.assigneeId,
      query.limit ?? 50,
      query.offset ?? 0,
    ],
    queryFn: () => listTasksRequest(status, query),
    ...options,
  });
}
