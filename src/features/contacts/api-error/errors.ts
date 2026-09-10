import { AppError } from "@/lib/errors";

export class ContactAlreadyExistsError extends AppError {
  constructor() {
    super("CONFLICT", {
      message: "A contact with this phone already exists.",
      fields: { phoneNumber: "A contact with this phone already exists." },
    });
  }
}

export class CustomerNotFoundError extends AppError {
  constructor() {
    super("NOT_FOUND", {
      message: "Customer not found.",
      fields: { customerId: "Customer not found." },
    });
  }
}

export class ContactNotFoundError extends AppError {
  constructor() {
    super("NOT_FOUND", {
      message: "Contact not found.",
      fields: { contactId: "Contact not found." },
    });
  }
}