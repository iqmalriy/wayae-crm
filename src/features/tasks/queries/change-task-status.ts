"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ChangeTaskStatusInput } from "../schemas/change-task-status.schema";
import type { ChangeTaskStatusOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ChangeTaskStatusOutput;
}

async function changeTaskStatusRequest(
  id: string,
  input: ChangeTaskStatusInput,
): Promise<ChangeTaskStatusOutput> {
  const response = await fetch(`/api/v1/tasks/${id}/status`, {
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

export type ChangeTaskStatusMutationOptions = UseMutationOptions<
  ChangeTaskStatusOutput,
  AppError,
  { id: string; input: ChangeTaskStatusInput }
>;

export function useChangeTaskStatus(options?: ChangeTaskStatusMutationOptions) {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ChangeTaskStatusInput }) =>
      changeTaskStatusRequest(id, input),
    ...options,
  });
}
