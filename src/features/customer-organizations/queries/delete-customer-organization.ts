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
}

async function deleteCustomerOrganizationRequest(
  id: string,
): Promise<{ message: string }> {
  const response = await fetch(`/api/v1/customer-organizations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  const body = (await response.json()) as SuccessBody;
  return { message: body.message };
}

export type DeleteCustomerOrganizationMutationOptions = UseMutationOptions<
  { message: string },
  AppError,
  string
>;

export function useDeleteCustomerOrganization(
  options?: DeleteCustomerOrganizationMutationOptions,
) {
  const onSuccess = options?.onSuccess;
  const onError = options?.onError;
  return useMutation({
    mutationFn: deleteCustomerOrganizationRequest,
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