"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { CreateLeadInput } from "../schemas/create-lead.schema";
import type { CreateLeadOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: CreateLeadOutput;
}

async function createLeadRequest(input: CreateLeadInput): Promise<CreateLeadOutput> {
  const response = await fetch("/api/v1/leads", {
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

export type CreateLeadMutationOptions = UseMutationOptions<
  CreateLeadOutput,
  AppError,
  CreateLeadInput
>;

export function useCreateLead(options?: CreateLeadMutationOptions) {
  return useMutation({ mutationFn: createLeadRequest, ...options });
}