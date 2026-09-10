"use client";
import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ListConversationQuery } from "../schemas/list-conversation.schema";
import type { ListConversationsOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: ListConversationsOutput;
}

async function listConversationsRequest(
  query: ListConversationQuery,
): Promise<ListConversationsOutput> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "")
      searchParams.set(key, String(value));
  }
  const response = await fetch(
    `/api/v1/conversations?${searchParams.toString()}`,
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

export type ListConversationsQueryOptions = Omit<
  UseInfiniteQueryOptions<ListConversationsOutput, AppError>,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>;

export function useInfiniteConversations(
  query: ListConversationQuery,
  options?: ListConversationsQueryOptions,
) {
  return useInfiniteQuery({
    queryKey: [
      "conversations",
      query.limit,
      query.search,
      query.status,
      query.waAccountId,
      query.sortBy,
      query.sortDir,
    ],
    queryFn: ({ pageParam }) =>
      listConversationsRequest({
        ...query,
        cursor: (pageParam as string | null) ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...options,
  });
}