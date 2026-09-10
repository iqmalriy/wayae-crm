import { MessageNotFoundError } from "../api-error/errors";
import { softDeleteMessage } from "../repositories/message.repository";

export async function deleteMessageForAdmin(
  conversationId: string,
  messageId: string,
): Promise<{ deleted: boolean }> {
  const deleted = await softDeleteMessage(conversationId, messageId);
  if (!deleted) throw new MessageNotFoundError();
  return { deleted: true };
}