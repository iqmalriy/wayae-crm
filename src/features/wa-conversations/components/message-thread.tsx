"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/datetime";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRole } from "@/hooks/use-role";
import { useInfiniteMessages } from "../queries/list-messages";
import { useDeleteMessage } from "../queries/delete-message";
import { useMarkConversationRead } from "../queries/mark-conversation-read";
import { MediaPreviewDialog } from "./media-preview-dialog";
import { MessageContent } from "./messages/message-content";
import type { MessageView } from "../types/response-types";

function MessageMenu({
  conversationId,
  message,
}: {
  conversationId: string;
  message: MessageView;
}) {
  const queryClient = useQueryClient();
  const { can } = useRole();

  const deleteMessage = useDeleteMessage({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", conversationId],
      });
    },
  });

  if (!can("admin")) return null;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Message options"
            className="text-muted-foreground"
          >
            <MoreVerticalIcon />
          </Button>
        }
      />
      <PopoverContent align="center" side="top" className="w-44 p-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() =>
            deleteMessage.mutate({
              conversationId,
              messageId: message.id,
            })
          }
          disabled={deleteMessage.isPending}
        >
          <Trash2Icon />
          {deleteMessage.isPending ? "Deleting..." : "Delete message"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function MessageBubble({
  conversationId,
  message,
  onPreview,
}: {
  conversationId: string;
  message: MessageView;
  onPreview: (message: MessageView) => void;
}) {
  const isMine = message.fromMe;
  return (
    <div
      className={cn(
        "flex w-full items-center gap-1",
        isMine ? "justify-end" : "justify-start",
      )}
    >
      {!isMine && <MessageMenu conversationId={conversationId} message={message} />}
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1 rounded-2xl px-3 py-2 text-sm",
          isMine
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted",
        )}
      >
        <MessageContent
          message={message}
          isMine={isMine}
          onPreview={onPreview}
        />
        <span
          className={cn(
            "self-end text-[10px]",
            isMine ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatRelativeTime(message.receivedAt)}
        </span>
      </div>
      {isMine && <MessageMenu conversationId={conversationId} message={message} />}
    </div>
  );
}

export function MessageThread({ conversationId }: { conversationId: string }) {
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteMessages(conversationId, { limit: 50, dir: "older" });

  const messages = useMemo(
    () => (data ? [...data.pages].reverse().flatMap((page) => page.messages) : []),
    [data],
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<{ conversationId: string; seq: number }>({
    conversationId: "",
    seq: 0,
  });
  const markReadRef = useRef<ReturnType<typeof useMarkConversationRead>>(
    undefined as never,
  );
  const [polled, setPolled] = useState<{
    conversationId: string;
    messages: MessageView[];
  }>({ conversationId: "", messages: [] });
  const [previewMessage, setPreviewMessage] = useState<MessageView | null>(null);

  const queryClient = useQueryClient();
  const markRead = useMarkConversationRead({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    markReadRef.current = markRead;
  });

  useEffect(() => {
    markReadRef.current.mutate(conversationId);
  }, [conversationId]);

  const baseSeq = useMemo(
    () => messages.reduce((max, message) => Math.max(max, message.seq), 0),
    [messages],
  );

  useQuery({
    queryKey: ["conversation-messages-poll", conversationId],
    queryFn: async () => {
      const isSameConversation = pollRef.current.conversationId === conversationId;
      const cursor = isSameConversation
        ? pollRef.current.seq
        : Math.max(baseSeq, pollRef.current.seq);
      pollRef.current = { conversationId, seq: cursor };

      const response = await fetch(
        `/api/v1/conversations/${conversationId}/messages?dir=newer&cursor=${cursor}&limit=50`,
      );
      if (!response.ok) return [] as MessageView[];
      const body = (await response.json()) as {
        data: { messages: MessageView[] };
      };
      const incoming = body.data?.messages ?? [];
      if (incoming.length === 0) return [] as MessageView[];

      pollRef.current = {
        conversationId,
        seq: incoming.reduce(
          (max, message) => Math.max(max, message.seq),
          cursor,
        ),
      };

      setPolled((previous) => {
        if (previous.conversationId !== conversationId) {
          return { conversationId, messages: incoming };
        }
        const existing = new Set(previous.messages.map((m) => m.id));
        const fresh = incoming.filter((m) => !existing.has(m.id));
        return {
          conversationId,
          messages: fresh.length
            ? [...previous.messages, ...fresh]
            : previous.messages,
        };
      });

      markRead.mutate(conversationId);
      return incoming;
    },
    refetchInterval: 5000,
    enabled: Boolean(conversationId),
  });

  const allMessages = useMemo(() => {
    const seen = new Set<string>();
    const polledMessages = polled.conversationId === conversationId ? polled.messages : [];
    return [...messages, ...polledMessages]
      .sort((a, b) => a.seq - b.seq)
      .filter((message) => {
        if (seen.has(message.id)) return false;
        seen.add(message.id);
        return true;
      });
  }, [messages, polled, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [conversationId, isPending, allMessages.length]);

  useEffect(() => {
    markReadRef.current.mutate(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, conversationId]);

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-1/2" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Failed to load messages.
        </p>
      </div>
    );
  }

  if (allMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      <div ref={topSentinelRef} className="flex justify-center">
        {isFetchingNextPage ? (
          <span className="text-xs text-muted-foreground">Loading older...</span>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        {allMessages.map((message) => (
          <MessageBubble
            key={message.id}
            conversationId={conversationId}
            message={message}
            onPreview={setPreviewMessage}
          />
        ))}
      </div>
      <div ref={bottomRef} />
      <MediaPreviewDialog
        open={Boolean(previewMessage)}
        onOpenChange={(open) => {
          if (!open) setPreviewMessage(null);
        }}
        message={previewMessage}
      />
    </div>
  );
}