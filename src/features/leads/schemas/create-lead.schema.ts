import { z } from "zod";

export const leadStages = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export const leadSources = [
  "inbound",
  "manual",
  "referral",
  "campaign",
] as const;

const emptyUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal("").transform(() => undefined as undefined));

const emptyText = z
  .string()
  .optional()
  .transform((v) => v || undefined);

const emptyEmail = z
  .string()
  .trim()
  .max(255)
  .email()
  .optional()
  .or(z.literal("").transform(() => undefined as undefined));

export const createLeadInput = z
  .object({
    name: z.string().trim().max(100).optional(),
    company: z.string().trim().max(200).optional(),
    phone: z.string().trim().max(30).optional(),
    email: emptyEmail,
    source: z.enum(leadSources).optional().default("manual"),
    assigneeId: emptyText,
    estimatedValue: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z
        .union([z.string(), z.number()])
        .optional()
        .refine((v) => v === undefined || Number.isFinite(Number(v)), {
          message: "Estimated value must be a valid number.",
        })
        .refine((v) => v === undefined || Number(v) > 0, {
          message: "Estimated value must be positive.",
        })
        .transform((v) => (v === undefined ? undefined : Number(v))),
    ),
    notes: z.string().trim().max(2000).optional(),
    contactId: emptyUuid,
    customerId: emptyUuid,
    customerOrganizationId: emptyUuid,
  })
  .refine(
    (data) =>
      data.contactId ||
      data.customerId ||
      data.name ||
      data.phone ||
      data.email,
    {
      message: "Provide at least a name, phone, or email.",
      path: ["name"],
    },
  )
  .refine((data) => data.contactId || data.phone, {
    message: "Phone is required when no contact is linked.",
    path: ["phone"],
  });

export type CreateLeadInput = z.infer<typeof createLeadInput>;
