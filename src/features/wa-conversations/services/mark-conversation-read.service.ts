import { AppError } from "@/lib/errors";
import { findAccessibleConversation } from "../repositories/message.repository";
import { markConversationRead } from "../repositories/conversation.repository";

export async function markConversationReadForUser(
  user: { id: string; role: string | null | undefined },
  conversationId: string,
): Promise<{ marked: boolean }> {
  const isAdmin = user.role === "admin";
  const conversation = await findAccessibleConversation(
    conversationId,
    user.id,
    isAdmin,
  );
  if (!conversation) {
    throw new AppError("NOT_FOUND", {
      message: "Conversation not found.",
    });
  }

  await markConversationRead(conversationId, user.id);
  return { marked: true };
}