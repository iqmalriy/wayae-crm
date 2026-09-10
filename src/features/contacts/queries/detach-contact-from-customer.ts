"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { toast } from "@/components/ui/toast";
import type { ContactView } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  message: string;
  data: { contact: ContactView };
}

async function detachContactFromCustomerRequest(
  contactId: string,
): Promise<{ message: string; data: { contact: ContactView } }> {
  const response = await fetch(
    `/api/v1/contacts/${contactId}/detach-from-customer`,
    { method: "POST" },
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

export type DetachContactFromCustomerMutationOptions = UseMutationOptions<
  { message: string; data: { contact: ContactView } },
  AppError,
  string
>;

export function useDetachContactFromCustomer(
  options?: DetachContactFromCustomerMutationOptions,
) {
  const onSuccess = options?.onSuccess;
  const onError = options?.onError;
  return useMutation({
    mutationFn: (contactId: string) =>
      detachContactFromCustomerRequest(contactId),
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