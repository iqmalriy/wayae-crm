"use client";

import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/components/breadcrumb-global";
import type { ConversationView } from "../types/response-types";
import { ConversationsList } from "./conversations-list";
import { ConversationDetail } from "./conversation-detail";

export function ConversationsPage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Conversations" },
    ]);
  }, [setItems]);

  const [selected, setSelected] = useState<ConversationView | null>(null);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <ConversationsList
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />
      <ConversationDetail
        conversation={selected}
        onDeleted={() => setSelected(null)}
      />
    </div>
  );
}