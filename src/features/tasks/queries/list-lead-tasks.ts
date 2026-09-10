"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListTasksOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListTasksOutput;
}

async function listLeadTasksRequest(leadId: string): Promise<ListTasksOutput> {
  const searchParams = new URLSearchParams({ leadId });
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

export type ListLeadTasksQueryKey = [string, string | undefined];

export type ListLeadTasksQueryOptions = UseQueryOptions<
  ListTasksOutput,
  AppError,
  ListTasksOutput,
  ListLeadTasksQueryKey
>;

export function useListLeadTasks(
  leadId: string | undefined,
  options?: Omit<ListLeadTasksQueryOptions, "queryKey" | "queryFn" | "enabled">,
) {
  return useQuery({
    queryKey: ["lead-tasks", leadId],
    queryFn: () => listLeadTasksRequest(leadId as string),
    enabled: !!leadId,
    ...options,
  });
}