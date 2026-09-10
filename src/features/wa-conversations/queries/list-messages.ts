"use client";
import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListMessagesQuery } from "../schemas/list-messages.schema";
import type { ListMessagesOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListMessagesOutput;
}

async function listMessagesRequest(
  conversationId: string,
  query: ListMessagesQuery,
): Promise<ListMessagesOutput> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    searchParams.set(key, String(value));
  }
  const response = await fetch(
    `/api/v1/conversations/${conversationId}/messages?${searchParams.toString()}`,
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const first = body?.errors?.[0];
    throw new AppError(first?.code ?? "INTERNAL", {
      message: body?.message ?? first?.code ?? "INTERNAL",
    });
  }
  return ((await response.json()) as SuccessBody).data;
}

export type ListMessagesQueryOptions = Omit<
  UseInfiniteQueryOptions<ListMessagesOutput, AppError>,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

export function useInfiniteMessages(
  conversationId: string,
  query: ListMessagesQuery,
  options?: ListMessagesQueryOptions,
) {
  return useInfiniteQuery({
    queryKey: ["conversation-messages", conversationId, query.limit, query.dir],
    queryFn: ({ pageParam }) =>
      listMessagesRequest(conversationId, {
        ...query,
        cursor: (pageParam as number | null) ?? undefined,
      }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(conversationId),
    ...options,
  });
}