import { AppError } from "@/lib/errors";

export class CustomerOrganizationNotFoundError extends AppError {
  constructor() {
    super("NOT_FOUND", {
      message: "Customer organization not found.",
    });
  }
}