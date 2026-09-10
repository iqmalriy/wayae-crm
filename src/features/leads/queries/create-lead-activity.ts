"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { CreateLeadActivityInput } from "../schemas/create-lead-activity.schema";
import type { CreateLeadActivityOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: CreateLeadActivityOutput;
}

async function createLeadActivityRequest(
  leadId: string,
  input: CreateLeadActivityInput,
): Promise<CreateLeadActivityOutput> {
  const response = await fetch(`/api/v1/leads/${leadId}/activities`, {
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
  return ((await response.json()) as SuccessBody).data;
}

export type CreateLeadActivityVariables = {
  leadId: string;
  input: CreateLeadActivityInput;
};

export type CreateLeadActivityMutationOptions = UseMutationOptions<
  CreateLeadActivityOutput,
  AppError,
  CreateLeadActivityVariables
>;

export function useCreateLeadActivity(options?: CreateLeadActivityMutationOptions) {
  return useMutation({
    mutationFn: ({ leadId, input }) => createLeadActivityRequest(leadId, input),
    ...options,
  });
}