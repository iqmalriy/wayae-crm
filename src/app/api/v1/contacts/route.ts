import { createContactHandler, listContactsHandler } from "@/features/contacts";

export const GET = listContactsHandler;
export const POST = createContactHandler;