"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { GetLeadOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: GetLeadOutput;
}

async function getLeadRequest(id: string): Promise<GetLeadOutput> {
  const response = await fetch(`/api/v1/leads/${id}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type GetLeadQueryOptions = UseQueryOptions<
  GetLeadOutput,
  AppError,
  GetLeadOutput,
  [string, string]
>;

export function useGetLead(
  id: string,
  options?: Omit<GetLeadQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadRequest(id),
    enabled: Boolean(id),
    ...options,
  });
}