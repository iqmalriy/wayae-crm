import { ConversationNotFoundError } from "../api-error/errors";
import { softDeleteConversation } from "../repositories/conversation.repository";

export async function deleteConversationForAdmin(
  id: string,
): Promise<{ deleted: boolean }> {
  const deleted = await softDeleteConversation(id);
  if (!deleted) throw new ConversationNotFoundError();
  return { deleted: true };
}