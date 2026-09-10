"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListCustomerQuery } from "../schemas/list-customer.schema";
import type { ListCustomersOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListCustomersOutput;
}

async function listCustomersRequest(
  query: ListCustomerQuery,
): Promise<ListCustomersOutput> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "")
      searchParams.set(key, String(value));
  }
  const response = await fetch(`/api/v1/customers?${searchParams.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListCustomersQueryOptions = UseQueryOptions<
  ListCustomersOutput,
  AppError,
  ListCustomersOutput,
  (string | number | boolean | undefined)[]
>;

export function useListCustomers(
  query: ListCustomerQuery,
  options?: Omit<ListCustomersQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [
      "customers",
      query.page,
      query.perPage,
      query.search,
      query.organizationId,
      query.status,
      query.isDecisionMaker,
      query.unassigned,
      query.sortBy,
      query.sortDir,
    ],
    queryFn: () => listCustomersRequest(query),
    ...options,
  });
}