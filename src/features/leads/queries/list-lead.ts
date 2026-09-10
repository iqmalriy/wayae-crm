"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListLeadsQuery } from "../schemas/list-lead.schema";
import type { ListLeadsOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListLeadsOutput;
}

async function listLeadsRequest(query: ListLeadsQuery): Promise<ListLeadsOutput> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  }
  const response = await fetch(`/api/v1/leads?${searchParams.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListLeadsQueryOptions = UseQueryOptions<
  ListLeadsOutput,
  AppError,
  ListLeadsOutput,
  (string | number | boolean | undefined)[]
>;

export function useListLeads(
  query: ListLeadsQuery,
  options?: Omit<ListLeadsQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [
      "leads",
      query.page,
      query.perPage,
      query.search,
      query.stage,
      query.ownerId,
      query.assigneeId,
      query.sortBy,
      query.sortDir,
    ],
    queryFn: () => listLeadsRequest(query),
    ...options,
  });
}