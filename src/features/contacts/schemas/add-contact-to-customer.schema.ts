import { z } from "zod";

export const addContactToCustomerInput = z.object({
  contactId: z.string().trim().min(1, "Contact is required."),
});

export type AddContactToCustomerInput = z.infer<
  typeof addContactToCustomerInput
>;