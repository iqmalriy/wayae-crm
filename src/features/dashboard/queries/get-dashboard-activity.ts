"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { DashboardActivityQuery } from "../schemas/get-dashboard.schema";
import type { DashboardActivity } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: DashboardActivity;
}

async function dashboardActivityRequest(
  query: DashboardActivityQuery,
): Promise<DashboardActivity> {
  const searchParams = new URLSearchParams();
  searchParams.set("range", query.range);
  searchParams.set("scope", query.scope);

  const response = await fetch(`/api/v1/dashboard/activity?${searchParams.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type DashboardActivityQueryOptions = UseQueryOptions<
  DashboardActivity,
  AppError,
  DashboardActivity,
  (string | number)[]
>;

export function useDashboardActivity(
  query: DashboardActivityQuery,
  options?: Omit<DashboardActivityQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["dashboard-activity", query.range, query.scope],
    queryFn: () => dashboardActivityRequest(query),
    refetchInterval: 60_000,
    ...options,
  });
}