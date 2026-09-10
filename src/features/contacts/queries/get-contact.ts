"use client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { GetContactOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: GetContactOutput;
}

async function getContactRequest(id: string): Promise<GetContactOutput> {
  const response = await fetch(`/api/v1/contacts/${id}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ContactQueryOptions = UseQueryOptions<
  GetContactOutput,
  AppError,
  GetContactOutput,
  [string, string]
>;

export function useContact(
  id: string,
  options?: Omit<ContactQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: () => getContactRequest(id),
    enabled: Boolean(id),
    ...options,
  });
}