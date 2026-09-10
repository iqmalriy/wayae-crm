"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { GetCustomerOrganizationOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: GetCustomerOrganizationOutput;
}

async function getCustomerOrganizationRequest(
  id: string,
): Promise<GetCustomerOrganizationOutput> {
  const response = await fetch(`/api/v1/customer-organizations/${id}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type CustomerOrganizationQueryOptions = UseQueryOptions<
  GetCustomerOrganizationOutput,
  AppError,
  GetCustomerOrganizationOutput,
  [string, string]
>;

export function useCustomerOrganization(
  id: string,
  options?: Omit<CustomerOrganizationQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["customer-organization", id],
    queryFn: () => getCustomerOrganizationRequest(id),
    enabled: Boolean(id),
    ...options,
  });
}