"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: { deleted: boolean };
}

async function deleteLeadRequest(id: string): Promise<{ deleted: boolean }> {
  const response = await fetch(`/api/v1/leads/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type DeleteLeadMutationOptions = UseMutationOptions<
  { deleted: boolean },
  AppError,
  string
>;

export function useDeleteLead(options?: DeleteLeadMutationOptions) {
  return useMutation({
    mutationFn: deleteLeadRequest,
    ...options,
  });
}