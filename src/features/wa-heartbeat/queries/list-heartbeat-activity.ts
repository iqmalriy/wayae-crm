"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";

export interface HeartbeatActivityPoint {
  timestamp: string;
  count: number;
}

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: HeartbeatActivityPoint[];
}

async function heartbeatActivityRequest(
  waAccountId: string,
  params: Record<string, string>,
): Promise<HeartbeatActivityPoint[]> {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(
    `/api/v1/wa-accounts/${waAccountId}/heartbeats/activity?${searchParams.toString()}`,
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

export type HeartbeatActivityQueryOptions = UseQueryOptions<
  HeartbeatActivityPoint[],
  AppError,
  HeartbeatActivityPoint[],
  (string | undefined)[]
>;

export function useHeartbeatActivity(
  waAccountId: string,
  params: { from?: string; to?: string; bucket?: string },
  options?: Omit<HeartbeatActivityQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [
      "wa-account-heartbeat-activity",
      waAccountId,
      params.from,
      params.to,
      params.bucket,
    ],
    queryFn: () =>
      heartbeatActivityRequest(
        waAccountId,
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
        ),
      ),
    refetchInterval: 30_000,
    ...options,
  });
}