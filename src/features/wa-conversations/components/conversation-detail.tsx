"use client";

import { useState } from "react";
import { ContactRoundIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/use-role";
import { resolveConversationName } from "../lib/resolve-name";
import { ContactDetailDialog } from "./contact-detail-dialog";
import { MessageThread } from "./message-thread";
import { DeleteConversationDialog } from "./delete-conversation-dialog";
import type { ConversationView } from "../types/response-types";

export function ConversationDetail({
  conversation,
  onDeleted,
}: {
  conversation: ConversationView | null;
  onDeleted: () => void;
}) {
  const { can } = useRole();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  if (!conversation) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Select a conversation to view messages.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">
            {resolveConversationName(conversation)}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.contact?.phone ?? conversation.waAccount?.phone ?? ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="secondary">{conversation.status}</Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            title="View contact"
            onClick={() => setContactDialogOpen(true)}
            disabled={!conversation.contact}
          >
            <ContactRoundIcon />
            <span className="sr-only">View contact</span>
          </Button>
          {can("admin") ? (
            <DeleteConversationDialog
              id={conversation.id}
              name={resolveConversationName(conversation)}
              onDeleted={onDeleted}
            />
          ) : null}
        </div>
      </header>

      <MessageThread conversationId={conversation.id} />

      <ContactDetailDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contactId={conversation.contact?.id ?? null}
      />
    </section>
  );
}