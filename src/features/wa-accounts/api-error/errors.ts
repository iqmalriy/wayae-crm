import { AppError } from "@/lib/errors";

export class WaAccountNotFoundError extends AppError {
  constructor() {
    super("NOT_FOUND", { message: "WhatsApp account not found." });
  }
}

export class WaAccountConflictError extends AppError {
  constructor() {
    super("CONFLICT", {
      message:
        "An active WhatsApp account already exists for this user and phone.",
    });
  }
}