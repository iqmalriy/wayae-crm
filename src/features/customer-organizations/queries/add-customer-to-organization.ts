"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { toast } from "@/components/ui/toast";
import type { AddCustomerToOrganizationInput } from "../schemas/add-customer-to-organization.schema";
import type { CustomerView } from "@/features/customers/types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  message: string;
  data: { customer: CustomerView };
}

async function addCustomerToOrganizationRequest(
  organizationId: string,
  input: AddCustomerToOrganizationInput,
): Promise<{ message: string; data: { customer: CustomerView } }> {
  const response = await fetch(
    `/api/v1/customer-organizations/${organizationId}/customers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
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

export type AddCustomerToOrganizationVariables = {
  organizationId: string;
} & AddCustomerToOrganizationInput;

export type AddCustomerToOrganizationMutationOptions = UseMutationOptions<
  { message: string; data: { customer: CustomerView } },
  AppError,
  AddCustomerToOrganizationVariables
>;

export function useAddCustomerToOrganization(
  options?: AddCustomerToOrganizationMutationOptions,
) {
  const onSuccess = options?.onSuccess;
  const onError = options?.onError;
  return useMutation({
    mutationFn: (variables: AddCustomerToOrganizationVariables) => {
      const { organizationId, ...input } = variables;
      return addCustomerToOrganizationRequest(organizationId, input);
    },
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