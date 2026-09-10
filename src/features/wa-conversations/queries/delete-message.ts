"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { toast } from "@/components/ui/toast";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  message: string;
  data: { deleted: boolean };
}

interface DeleteMessageParams {
  conversationId: string;
  messageId: string;
}

async function deleteMessageRequest(
  params: DeleteMessageParams,
): Promise<{ message: string; data: { deleted: boolean } }> {
  const response = await fetch(
    `/api/v1/conversations/${params.conversationId}/messages/${params.messageId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  const body = (await response.json()) as SuccessBody;
  return { message: body.message, data: body.data };
}

export type DeleteMessageMutationOptions = UseMutationOptions<
  { message: string; data: { deleted: boolean } },
  AppError,
  DeleteMessageParams
>;

export function useDeleteMessage(options?: DeleteMessageMutationOptions) {
  const onSuccess = options?.onSuccess;
  const onError = options?.onError;
  return useMutation({
    mutationFn: deleteMessageRequest,
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