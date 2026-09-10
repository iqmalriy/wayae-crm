"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListPhoneRevealsOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListPhoneRevealsOutput;
}

async function listPhoneRevealsRequest(
  id: string,
): Promise<ListPhoneRevealsOutput> {
  const response = await fetch(`/api/v1/contacts/${id}/reveal`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type PhoneRevealsQueryOptions = UseQueryOptions<
  ListPhoneRevealsOutput,
  AppError,
  ListPhoneRevealsOutput,
  [string, string, string]
>;

export function useContactPhoneReveals(
  id: string,
  options?: Omit<PhoneRevealsQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["contact", id, "reveals"],
    queryFn: () => listPhoneRevealsRequest(id),
    enabled: Boolean(id),
    ...options,
  });
}