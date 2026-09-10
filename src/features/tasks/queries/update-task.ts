"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { UpdateTaskInput } from "../schemas/update-task.schema";
import type { UpdateTaskOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: UpdateTaskOutput;
}

async function updateTaskRequest(
  id: string,
  input: UpdateTaskInput,
): Promise<UpdateTaskOutput> {
  const response = await fetch(`/api/v1/tasks/${id}`, {
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

export type UpdateTaskMutationOptions = UseMutationOptions<
  UpdateTaskOutput,
  AppError,
  { id: string; input: UpdateTaskInput }
>;

export function useUpdateTask(options?: UpdateTaskMutationOptions) {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTaskRequest(id, input),
    ...options,
  });
}
