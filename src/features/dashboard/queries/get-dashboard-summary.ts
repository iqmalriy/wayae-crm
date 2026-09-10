"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { DashboardSummaryQuery } from "../schemas/get-dashboard.schema";
import type { DashboardSummary } from "../types/response-types";

export type DashboardSummaryInput = Pick<
  DashboardSummaryQuery,
  "range" | "scope"
> & { limit?: number };

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: DashboardSummary;
}

async function dashboardSummaryRequest(
  query: DashboardSummaryInput,
): Promise<DashboardSummary> {
  const searchParams = new URLSearchParams();
  searchParams.set("range", query.range);
  searchParams.set("scope", query.scope);
  searchParams.set("limit", String(query.limit ?? 8));

  const response = await fetch(`/api/v1/dashboard/summary?${searchParams.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type DashboardSummaryQueryOptions = UseQueryOptions<
  DashboardSummary,
  AppError,
  DashboardSummary,
  (string | number)[]
>;

export function useDashboardSummary(
  query: DashboardSummaryInput,
  options?: Omit<DashboardSummaryQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["dashboard-summary", query.range, query.scope, query.limit ?? 8],
    queryFn: () => dashboardSummaryRequest(query),
    refetchInterval: 30_000,
    ...options,
  });
}