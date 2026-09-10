"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { toast } from "@/components/ui/toast";
import type { RevealContactPhoneInput } from "../schemas/reveal-contact-phone.schema";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: { phone: string };
}

async function revealContactPhoneRequest(
  contactId: string,
  input: RevealContactPhoneInput,
): Promise<{ phone: string }> {
  const response = await fetch(`/api/v1/contacts/${contactId}/reveal-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
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

export type RevealContactPhoneVariables = {
  contactId: string;
} & RevealContactPhoneInput;

export type RevealContactPhoneMutationOptions = UseMutationOptions<
  { phone: string },
  AppError,
  RevealContactPhoneVariables
>;

export function useRevealContactPhone(
  options?: RevealContactPhoneMutationOptions,
) {
  const onSuccess = options?.onSuccess;
  const onError = options?.onError;
  return useMutation({
    mutationFn: (variables: RevealContactPhoneVariables) => {
      const { contactId, ...input } = variables;
      return revealContactPhoneRequest(contactId, input);
    },
    onSuccess: (result, variables, onMutateResult, context) => {
      onSuccess?.(result, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.add({ type: "error", title: error.message });
      onError?.(error as AppError, variables, onMutateResult, context);
    },
  });
}