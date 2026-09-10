"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { UpdateCustomerInput } from "../schemas/update-customer.schema";
import type { UpdateCustomerOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: UpdateCustomerOutput;
}

async function updateCustomerRequest(
  id: string,
  input: UpdateCustomerInput,
): Promise<UpdateCustomerOutput> {
  const response = await fetch(`/api/v1/customers/${id}`, {
    method: "PATCH",
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
  return ((await response.json()) as SuccessBody).data;
}

export type UpdateCustomerVariables = {
  id: string;
  input: UpdateCustomerInput;
};

export type UpdateCustomerMutationOptions = UseMutationOptions<
  UpdateCustomerOutput,
  AppError,
  UpdateCustomerVariables
>;

export function useUpdateCustomer(options?: UpdateCustomerMutationOptions) {
  return useMutation({
    mutationFn: ({ id, input }) => updateCustomerRequest(id, input),
    ...options,
  });
}