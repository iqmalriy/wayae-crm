export { censorPhone, censorEmail } from "@/lib/censor";

export interface LeadActor {
  userId: string;
  role: "admin" | "staff";
}

export function canViewLead(
  actor: LeadActor,
  lead: { ownerId: string | null; assigneeId: string | null },
): boolean {
  return (
    actor.role === "admin" ||
    lead.ownerId === actor.userId ||
    lead.assigneeId === actor.userId
  );
}