"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { GetTaskOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: GetTaskOutput;
}

async function getTaskRequest(id: string): Promise<GetTaskOutput> {
  const response = await fetch(`/api/v1/tasks/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type GetTaskQueryKey = [string, string | undefined];

export type GetTaskQueryOptions = UseQueryOptions<
  GetTaskOutput,
  AppError,
  GetTaskOutput,
  GetTaskQueryKey
>;

export function useGetTask(
  id: string | undefined,
  options?: Omit<GetTaskQueryOptions, "queryKey" | "queryFn" | "enabled">,
) {
  return useQuery({
    queryKey: ["task-detail", id],
    queryFn: () => getTaskRequest(id as string),
    enabled: !!id,
    ...options,
  });
}
