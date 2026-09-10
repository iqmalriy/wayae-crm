import {
  and,
  asc,
  desc,
  eq,
  gt,
  ilike,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  conversations,
  contacts,
  conversationReads,
  customers,
  messages,
  user,
  waAccounts,
} from "@/lib/db/schema";

export type SortField = "lastMessageAt" | "title" | "createdAt";

export interface ConversationCursor {
  field: SortField;
  dir: "asc" | "desc";
  value: string;
  id: string;
}

export interface ListConversationsParams {
  limit: number;
  cursor: ConversationCursor | null;
  search?: string;
  status?: "open" | "closed";
  waAccountId?: string;
  sortBy: SortField;
  sortDir: "asc" | "desc";
  callerId: string;
  isAdmin: boolean;
}

export interface ConversationListRow {
  id: string;
  title: string | null;
  chatType: "chat" | "group";
  status: "open" | "closed";
  ownerId: string | null;
  messageCount: number;
  lastMessageAt: Date | null;
  lastMessageFromMe: boolean | null;
  lastMessagePreview: string | null;
  createdAt: Date;
  contactId: string | null;
  contactPhone: string | null;
  contactDisplayName: string | null;
  customerId: string | null;
  customerName: string | null;
  waAccountId: string | null;
  waAccountPhone: string | null;
  waAccountLabel: string | null;
  ownerName: string | null;
  unreadCount: number;
  sortValue: unknown;
}

const sortExpressions: Record<SortField, SQL> = {
  lastMessageAt: sql`coalesce(${conversations.lastMessageAt}, ${conversations.createdAt})`,
  title: sql`coalesce(${conversations.title}, '')`,
  createdAt: sql`${conversations.createdAt}`,
};

function cursorValue(cursor: ConversationCursor): Date | string {
  return cursor.field === "title" ? cursor.value : new Date(cursor.value);
}

function buildCursorCondition(
  cursor: ConversationCursor,
  isAsc: boolean,
): SQL {
  const expr = sortExpressions[cursor.field];
  const value = cursorValue(cursor);
  const compare = isAsc ? gt : lt;
  const tiebreak = isAsc ? gt : lt;
  return (
    or(
      compare(expr, value),
      and(eq(expr, value), tiebreak(conversations.id, cursor.id)),
    ) ?? sql`false`
  );
}

export async function softDeleteConversation(id: string): Promise<boolean> {
  const rows = await db
    .update(conversations)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(conversations.id, id), isNull(conversations.deletedAt)))
    .returning({ id: conversations.id });
  return rows.length > 0;
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const [row] = await db
    .select({
      maxSeq: sql<number>`coalesce(max(${messages.seq}), 0)`,
    })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        isNull(messages.deletedAt),
      ),
    );

  const maxSeq = row?.maxSeq ?? 0;
  const readAt = new Date();
  await db
    .insert(conversationReads)
    .values({
      conversationId,
      userId,
      lastReadMessageSeq: maxSeq,
      lastReadAt: readAt,
    })
    .onConflictDoUpdate({
      target: [conversationReads.conversationId, conversationReads.userId],
      set: { lastReadMessageSeq: maxSeq, lastReadAt: readAt },
    });
}

export interface ConversationPollRow {
  id: string;
  title: string | null;
  customerName: string | null;
  contactDisplayName: string | null;
  contactPhone: string | null;
  lastMessageAt: Date | null;
  lastMessageFromMe: boolean | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export async function totalUnreadCount(params: {
  callerId: string;
  isAdmin: boolean;
}): Promise<number> {
  const conditions: SQL[] = [isNull(conversations.deletedAt)];
  if (!params.isAdmin) {
    conditions.push(eq(conversations.ownerId, params.callerId));
  }

  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum((
        select count(*) from ${messages}
        where ${messages.conversationId} = ${conversations.id}
          and ${messages.fromMe} = false
          and ${messages.deletedAt} is null
          and ${messages.seq} > coalesce(${conversationReads.lastReadMessageSeq}, 0)
      )), 0)`,
    })
    .from(conversations)
    .leftJoin(
      conversationReads,
      and(
        eq(conversationReads.conversationId, conversations.id),
        eq(conversationReads.userId, params.callerId),
      ),
    )
    .where(and(...conditions));

  return row?.total ?? 0;
}

export async function listChangedConversations(
  params: {
    since: Date | null;
    callerId: string;
    isAdmin: boolean;
    limit?: number;
  },
): Promise<ConversationPollRow[]> {
  const conditions: SQL[] = [isNull(conversations.deletedAt)];
  if (!params.isAdmin) {
    conditions.push(eq(conversations.ownerId, params.callerId));
  }
  if (params.since) {
    conditions.push(gt(conversations.lastMessageAt, params.since));
  }

  return db
    .select({
      id: conversations.id,
      title: conversations.title,
      customerName: customers.fullName,
      contactDisplayName: contacts.displayName,
      contactPhone: contacts.phoneNumber,
      lastMessageAt: conversations.lastMessageAt,
      lastMessageFromMe: conversations.lastMessageFromMe,
      lastMessagePreview: conversations.lastMessagePreview,
      unreadCount: sql<number>`coalesce((
        select count(*) from ${messages}
        where ${messages.conversationId} = ${conversations.id}
          and ${messages.fromMe} = false
          and ${messages.deletedAt} is null
          and ${messages.seq} > coalesce(${conversationReads.lastReadMessageSeq}, 0)
      ), 0)`,
    })
    .from(conversations)
    .leftJoin(contacts, eq(contacts.id, conversations.contactId))
    .leftJoin(customers, eq(customers.id, contacts.customerId))
    .leftJoin(
      conversationReads,
      and(
        eq(conversationReads.conversationId, conversations.id),
        eq(conversationReads.userId, params.callerId),
      ),
    )
    .where(and(...conditions))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(params.limit ?? 50);
}

export async function listConversationPage(
  params: ListConversationsParams,
): Promise<{ rows: ConversationListRow[]; hasMore: boolean }> {
  const { limit, cursor, search, status, waAccountId, sortBy, sortDir } =
    params;
  const isAsc = sortDir === "asc";

  const conditions: SQL[] = [isNull(conversations.deletedAt)];
  if (!params.isAdmin) {
    conditions.push(eq(conversations.ownerId, params.callerId));
  }
  if (params.isAdmin && waAccountId) {
    conditions.push(eq(conversations.waAccountId, waAccountId));
  }
  if (status) conditions.push(eq(conversations.status, status));
  if (cursor) conditions.push(buildCursorCondition(cursor, isAsc));
  if (search) {
    conditions.push(
      or(
        ilike(conversations.title, `%${search}%`),
        ilike(contacts.displayName, `%${search}%`),
        ilike(contacts.phoneNumber, `%${search}%`),
      ) as SQL,
    );
  }

  const where = and(...conditions);
  const orderBy = isAsc
    ? [asc(sortExpressions[sortBy]), asc(conversations.id)]
    : [desc(sortExpressions[sortBy]), desc(conversations.id)];

  const rows = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      chatType: conversations.chatType,
      status: conversations.status,
      ownerId: conversations.ownerId,
      messageCount: conversations.messageCount,
      lastMessageAt: conversations.lastMessageAt,
      lastMessageFromMe: conversations.lastMessageFromMe,
      lastMessagePreview: conversations.lastMessagePreview,
      createdAt: conversations.createdAt,
      contactId: contacts.id,
      contactPhone: contacts.phoneNumber,
      contactDisplayName: contacts.displayName,
      customerId: customers.id,
      customerName: customers.fullName,
      waAccountId: waAccounts.id,
      waAccountPhone: waAccounts.phone,
      waAccountLabel: waAccounts.label,
      ownerName: user.name,
      unreadCount: sql<number>`coalesce((
        select count(*) from ${messages}
        where ${messages.conversationId} = ${conversations.id}
          and ${messages.fromMe} = false
          and ${messages.deletedAt} is null
          and ${messages.seq} > coalesce(${conversationReads.lastReadMessageSeq}, 0)
      ), 0)`,
      sortValue: sortExpressions[sortBy],
    })
    .from(conversations)
    .leftJoin(contacts, eq(contacts.id, conversations.contactId))
    .leftJoin(customers, eq(customers.id, contacts.customerId))
    .leftJoin(waAccounts, eq(waAccounts.id, conversations.waAccountId))
    .leftJoin(user, eq(user.id, conversations.ownerId))
    .leftJoin(
      conversationReads,
      and(
        eq(conversationReads.conversationId, conversations.id),
        eq(conversationReads.userId, params.callerId),
      ),
    )
    .where(where)
    .orderBy(...orderBy)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  return { rows: hasMore ? rows.slice(0, limit) : rows, hasMore };
}