"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListUserQuery } from "../schemas/list-user.schema";
import type { ListUsersOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListUsersOutput;
}

async function listUsersRequest(query: ListUserQuery): Promise<ListUsersOutput> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  }
  const response = await fetch(`/api/v1/users?${searchParams.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListUsersQueryOptions = UseQueryOptions<
  ListUsersOutput,
  AppError,
  ListUsersOutput,
  (string | number | undefined)[]
>;

export function useListUsers(
  query: ListUserQuery,
  options?: Omit<ListUsersQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["users", query.page, query.perPage, query.search, query.sortBy, query.sortDir],
    queryFn: () => listUsersRequest(query),
    ...options,
  });
}