import { AppError } from "@/lib/errors";

export class LeadNotFoundError extends AppError {
  constructor() {
    super("NOT_FOUND", {
      message: "Lead not found.",
      fields: { leadId: "Lead not found." },
    });
  }
}

export class LeadAlreadyExistsError extends AppError {
  constructor() {
    super("CONFLICT", {
      message: "A lead with this phone already exists.",
      fields: { phone: "A lead with this phone already exists." },
    });
  }
}