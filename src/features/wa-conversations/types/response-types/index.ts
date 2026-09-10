export type ConversationChatType = "chat" | "group";
export type ConversationStatus = "open" | "closed";

export interface ConversationView {
  id: string;
  title: string | null;
  chatType: ConversationChatType;
  status: ConversationStatus;
  ownerId: string | null;
  ownerName: string | null;
  unreadCount: number;
  messageCount: number;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean | null;
  lastMessagePreview: string | null;
  contact: {
    id: string;
    phone: string;
    displayName: string;
  } | null;
  customer: {
    id: string;
    name: string;
  } | null;
  waAccount: {
    id: string;
    phone: string;
    label: string;
  } | null;
  createdAt: string;
}

export interface ListConversationsOutput {
  conversations: ConversationView[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface MessageView {
  id: string;
  seq: number;
  fromMe: boolean;
  body: string | null;
  type: string | null;
  media: {
    mediaId: string | null;
    mimetype: string | null;
    filename: string | null;
    filesize: number | null;
  } | null;
  receivedAt: string | null;
  createdAt: string;
}

export interface ListMessagesOutput {
  messages: MessageView[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface PolledConversation {
  id: string;
  name: string | null;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface PollConversationsOutput {
  conversations: PolledConversation[];
  totalUnreadCount: number;
  serverTs: string;
}