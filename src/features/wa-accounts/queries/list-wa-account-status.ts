"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { WaAccountStatusView } from "../services/list-wa-account-status.service";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: WaAccountStatusView[];
}

async function listWaAccountStatusRequest(): Promise<WaAccountStatusView[]> {
  const response = await fetch(`/api/v1/wa-accounts/status`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListWaAccountStatusOptions = UseQueryOptions<
  WaAccountStatusView[],
  AppError,
  WaAccountStatusView[],
  string[]
>;

export function useListWaAccountStatus(
  options?: Omit<ListWaAccountStatusOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["wa-accounts-status"],
    queryFn: listWaAccountStatusRequest,
    refetchInterval: 30_000,
    ...options,
  });
}