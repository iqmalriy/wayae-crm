"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ChangeLeadStageInput } from "../schemas/change-lead-stage.schema";
import type { ChangeLeadStageOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ChangeLeadStageOutput;
}

async function changeLeadStageRequest(
  id: string,
  input: ChangeLeadStageInput,
): Promise<ChangeLeadStageOutput> {
  const response = await fetch(`/api/v1/leads/${id}/stage`, {
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

export type ChangeLeadStageVariables = {
  id: string;
  input: ChangeLeadStageInput;
};

export type ChangeLeadStageMutationOptions = UseMutationOptions<
  ChangeLeadStageOutput,
  AppError,
  ChangeLeadStageVariables
>;

export function useChangeLeadStage(options?: ChangeLeadStageMutationOptions) {
  return useMutation({
    mutationFn: ({ id, input }) => changeLeadStageRequest(id, input),
    ...options,
  });
}