import { AppError } from "@/lib/errors";

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super("CONFLICT", { message: "A user with this email already exists." });
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super("NOT_FOUND", { message: "User not found." });
  }
}