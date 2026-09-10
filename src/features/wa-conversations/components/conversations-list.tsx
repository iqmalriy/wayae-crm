"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteConversations } from "../queries/list-conversation";
import { WaAccountCombobox } from "@/features/wa-accounts/components/wa-account-combobox";
import type { ConversationView } from "../types/response-types";
import { ConversationListItem } from "./conversation-list-item";

interface ConversationsListProps {
  selectedId: string | null;
  onSelect: (conversation: ConversationView) => void;
}

export function ConversationsList({
  selectedId,
  onSelect,
}: ConversationsListProps) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [waAccountId, setWaAccountId] = useState("");

  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteConversations(
    {
      limit: 20,
      search: search || undefined,
      waAccountId: waAccountId || undefined,
      sortBy: "lastMessageAt",
      sortDir: "desc",
    },
    { refetchInterval: 15_000 },
  );

  const conversations = data?.pages.flatMap((page) => page.conversations) ?? [];
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0]?.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, conversations.length]);

  return (
    <aside className="flex w-96 shrink-0 flex-col border-r">
<div className="flex flex-col gap-2 border-b p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        <WaAccountCombobox
          placeholder="Filter by account..."
          showClear
          onValueChange={setWaAccountId}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPending ? (
          <div className="flex flex-col gap-1 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 px-3 py-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === selectedId}
              onClick={() => onSelect(conversation)}
            />
          ))
        )}

        <div
          ref={sentinelRef}
          className="py-3 text-center text-xs text-muted-foreground"
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
              ? ""
              : conversations.length > 0
                ? "End of conversations"
                : isPending
                  ? ""
                  : "No conversations yet."}
        </div>
      </div>
    </aside>
  );
}