"use client";

import { createContext, useContext } from "react";
import { usePollConversations } from "../queries/poll-conversations";

const ConversationUnreadContext = createContext<{ totalUnreadCount: number }>({
  totalUnreadCount: 0,
});

export function useConversationUnread() {
  return useContext(ConversationUnreadContext);
}

export function ConversationsPoller({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = usePollConversations({ interval: 5000 });
  return (
    <ConversationUnreadContext.Provider
      value={{ totalUnreadCount: data?.totalUnreadCount ?? 0 }}
    >
      {children}
    </ConversationUnreadContext.Provider>
  );
}