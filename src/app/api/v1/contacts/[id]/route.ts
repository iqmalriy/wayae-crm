import {
  getContactHandler,
  updateContactHandler,
  deleteContactHandler,
} from "@/features/contacts";

export const GET = getContactHandler;
export const PATCH = updateContactHandler;
export const DELETE = deleteContactHandler;