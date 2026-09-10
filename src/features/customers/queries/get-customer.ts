"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { GetCustomerOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: GetCustomerOutput;
}

async function getCustomerRequest(id: string): Promise<GetCustomerOutput> {
  const response = await fetch(`/api/v1/customers/${id}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type CustomerQueryOptions = UseQueryOptions<
  GetCustomerOutput,
  AppError,
  GetCustomerOutput,
  [string, string]
>;

export function useCustomer(
  id: string,
  options?: Omit<CustomerQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerRequest(id),
    enabled: Boolean(id),
    ...options,
  });
}