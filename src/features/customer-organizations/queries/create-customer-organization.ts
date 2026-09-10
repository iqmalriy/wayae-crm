"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { toast } from "@/components/ui/toast";
import type { CreateCustomerOrganizationInput } from "../schemas/create-customer-organization.schema";
import type { CreateCustomerOrganizationOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  message: string;
  data: CreateCustomerOrganizationOutput;
}

async function createCustomerOrganizationRequest(
  input: CreateCustomerOrganizationInput,
): Promise<{ message: string; data: CreateCustomerOrganizationOutput }> {
  const response = await fetch("/api/v1/customer-organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
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

export type CreateCustomerOrganizationMutationOptions = UseMutationOptions<
  { message: string; data: CreateCustomerOrganizationOutput },
  AppError,
  CreateCustomerOrganizationInput
>;

export function useCreateCustomerOrganization(
  options?: CreateCustomerOrganizationMutationOptions,
) {
  const onSuccess = options?.onSuccess;
  const onError = options?.onError;
  return useMutation({
    mutationFn: createCustomerOrganizationRequest,
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