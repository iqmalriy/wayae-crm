"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListWaAccountQuery } from "../schemas/list-wa-account.schema";
import type { ListWaAccountsOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListWaAccountsOutput;
}

async function listWaAccountsRequest(
  query: ListWaAccountQuery,
): Promise<ListWaAccountsOutput> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "")
      searchParams.set(key, String(value));
  }
  const response = await fetch(`/api/v1/wa-accounts?${searchParams.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListWaAccountsQueryOptions = UseQueryOptions<
  ListWaAccountsOutput,
  AppError,
  ListWaAccountsOutput,
  (string | number | undefined)[]
>;

export function useListWaAccounts(
  query: ListWaAccountQuery,
  options?: Omit<ListWaAccountsQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [
      "wa-accounts",
      query.page,
      query.perPage,
      query.search,
      query.sortBy,
      query.sortDir,
    ],
    queryFn: () => listWaAccountsRequest(query),
    refetchInterval: 30_000,
    ...options,
  });
}