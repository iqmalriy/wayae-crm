"use client";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { CreateTaskInput } from "../schemas/create-task.schema";
import type { CreateTaskOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: CreateTaskOutput;
}

async function createTaskRequest(input: CreateTaskInput): Promise<CreateTaskOutput> {
  const response = await fetch("/api/v1/tasks", {
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

export type CreateTaskMutationOptions = UseMutationOptions<
  CreateTaskOutput,
  AppError,
  CreateTaskInput
>;

export function useCreateTask(options?: CreateTaskMutationOptions) {
  return useMutation({ mutationFn: createTaskRequest, ...options });
}