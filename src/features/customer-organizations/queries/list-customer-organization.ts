"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListCustomerOrganizationQuery } from "../schemas/list-customer-organization.schema";
import type { ListCustomerOrganizationsOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListCustomerOrganizationsOutput;
}

async function listCustomerOrganizationsRequest(
  query: ListCustomerOrganizationQuery,
): Promise<ListCustomerOrganizationsOutput> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "")
      searchParams.set(key, String(value));
  }
  const response = await fetch(
    `/api/v1/customer-organizations?${searchParams.toString()}`,
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListCustomerOrganizationsQueryOptions = UseQueryOptions<
  ListCustomerOrganizationsOutput,
  AppError,
  ListCustomerOrganizationsOutput,
  (string | number | undefined)[]
>;

export function useListCustomerOrganizations(
  query: ListCustomerOrganizationQuery,
  options?: Omit<
    ListCustomerOrganizationsQueryOptions,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [
      "customer-organizations",
      query.page,
      query.perPage,
      query.search,
      query.type,
      query.status,
      query.sortBy,
      query.sortDir,
    ],
    queryFn: () => listCustomerOrganizationsRequest(query),
    ...options,
  });
}