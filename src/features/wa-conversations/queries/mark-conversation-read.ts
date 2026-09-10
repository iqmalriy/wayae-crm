"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: { marked: boolean };
}

async function markConversationReadRequest(
  conversationId: string,
): Promise<{ marked: boolean }> {
  const response = await fetch(`/api/v1/conversations/${conversationId}/read`, {
    method: "POST",
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

export type MarkConversationReadMutationOptions = UseMutationOptions<
  { marked: boolean },
  AppError,
  string
>;

export function useMarkConversationRead(
  options?: MarkConversationReadMutationOptions,
) {
  return useMutation({
    mutationFn: markConversationReadRequest,
    ...options,
  });
}