"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListContactQuery } from "../schemas/list-contact.schema";
import type { ListContactsOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListContactsOutput;
}

async function listContactsRequest(
  query: ListContactQuery,
): Promise<ListContactsOutput> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  }
  const response = await fetch(`/api/v1/contacts?${searchParams.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListContactsQueryOptions = UseQueryOptions<
  ListContactsOutput,
  AppError,
  ListContactsOutput,
  (string | number | boolean | undefined)[]
>;

export function useListContacts(
  query: ListContactQuery,
  options?: Omit<ListContactsQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["contacts", query.page, query.perPage, query.search, query.customerId, query.unassigned, query.sortBy, query.sortDir],
    queryFn: () => listContactsRequest(query),
    ...options,
  });
}