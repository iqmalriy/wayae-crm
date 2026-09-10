"use client";

import Link from "next/link";
import { ContactRoundIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/datetime";
import { resolveConversationName } from "../lib/resolve-name";
import type { ConversationView } from "../types/response-types";

interface ConversationListItemProps {
  conversation: ConversationView;
  active: boolean;
  onClick: () => void;
}

export function ConversationListItem({
  conversation,
  active,
  onClick,
}: ConversationListItemProps) {
  return (
    <div className="flex items-stretch">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1 border-b px-4 py-3 text-left transition-colors",
          active ? "bg-muted" : "hover:bg-muted/50",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">
            {resolveConversationName(conversation)}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-muted-foreground">
            {conversation.lastMessageFromMe ? "You: " : ""}
            {conversation.lastMessagePreview ?? "No messages yet"}
          </span>
          {conversation.unreadCount > 0 ? (
            <Badge className="shrink-0">{conversation.unreadCount}</Badge>
          ) : null}
        </div>
      </button>

      {conversation.customer ? (
        <Link
          href={`/p/customers/${conversation.customer.id}`}
          aria-label={`View customer ${conversation.customer.name}`}
          title="View customer"
          className="flex shrink-0 items-center border-b border-l px-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ContactRoundIcon className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}