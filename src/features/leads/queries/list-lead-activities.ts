"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListLeadActivitiesOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListLeadActivitiesOutput;
}

async function listLeadActivitiesRequest(
  id: string,
): Promise<ListLeadActivitiesOutput> {
  const response = await fetch(`/api/v1/leads/${id}/activities`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type LeadActivitiesQueryOptions = UseQueryOptions<
  ListLeadActivitiesOutput,
  AppError,
  ListLeadActivitiesOutput,
  [string, string]
>;

export function useLeadActivities(
  leadId: string,
  options?: Omit<LeadActivitiesQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: () => listLeadActivitiesRequest(leadId),
    enabled: Boolean(leadId),
    ...options,
  });
}