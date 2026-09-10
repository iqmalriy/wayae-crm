"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { UpdateLeadInput } from "../schemas/update-lead.schema";
import type { UpdateLeadOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: UpdateLeadOutput;
}

async function updateLeadRequest(
  id: string,
  input: UpdateLeadInput,
): Promise<UpdateLeadOutput> {
  const response = await fetch(`/api/v1/leads/${id}`, {
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

export type UpdateLeadVariables = {
  id: string;
  input: UpdateLeadInput;
};

export type UpdateLeadMutationOptions = UseMutationOptions<
  UpdateLeadOutput,
  AppError,
  UpdateLeadVariables
>;

export function useUpdateLead(options?: UpdateLeadMutationOptions) {
  return useMutation({
    mutationFn: ({ id, input }) => updateLeadRequest(id, input),
    ...options,
  });
}