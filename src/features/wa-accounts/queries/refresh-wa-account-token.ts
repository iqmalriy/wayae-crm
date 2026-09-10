"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { toast } from "@/components/ui/toast";
import type { RefreshWaAccountTokenOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  message: string;
  data: RefreshWaAccountTokenOutput;
}

async function refreshWaAccountTokenRequest(
  id: string,
): Promise<{ message: string; data: RefreshWaAccountTokenOutput }> {
  const response = await fetch(`/api/v1/wa-accounts/${id}`, {
    method: "POST",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    const fields = Object.fromEntries(
      body?.errors?.filter((e) => e.path).map((e) => [e.path!, e.message]) ?? [],
    );
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
      fields,
    });
  }
  const body = (await response.json()) as SuccessBody;
  return { message: body.message, data: body.data };
}

export type RefreshWaAccountTokenMutationOptions = UseMutationOptions<
  { message: string; data: RefreshWaAccountTokenOutput },
  AppError,
  string
>;

export function useRefreshWaAccountToken(
  options?: RefreshWaAccountTokenMutationOptions,
) {
  const onSuccess = options?.onSuccess;
  const onError = options?.onError;
  return useMutation({
    mutationFn: refreshWaAccountTokenRequest,
    onSuccess: (result, variables, onMutateResult, context) => {
      toast.add({ type: "success", title: result.message });
      onSuccess?.(result, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.add({ type: "error", title: error.message });
      onError?.(error as AppError, variables, onMutateResult, context);
    },
  });
}