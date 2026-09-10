import { AppError } from "@/lib/errors";

export class ConversationNotFoundError extends AppError {
  constructor() {
    super("NOT_FOUND", { message: "Conversation not found." });
  }
}

export class MessageNotFoundError extends AppError {
  constructor() {
    super("NOT_FOUND", { message: "Message not found." });
  }
}