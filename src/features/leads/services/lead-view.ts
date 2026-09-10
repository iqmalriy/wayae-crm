import type {
  LeadContactRef,
  LeadCostumerRef,
  LeadDetailView,
  LeadEmailRef,
  LeadLead,
  LeadOrganizationRef,
} from "../types/response-types";
import {
  canViewLead,
  censorEmail,
  censorPhone,
  type LeadActor,
} from "../utils/censor";

export function resolveCostumer(row: {
  costumerName: string | null;
  customerId: string | null;
  contactName: string | null;
  contactId: string | null;
  name: string | null;
}): LeadCostumerRef {
  if (row.costumerName) {
    return { name: row.costumerName, id: row.customerId, from: "costumer" };
  }
  if (row.contactName) {
    return { name: row.contactName, id: row.contactId, from: "contact" };
  }
  return { name: row.name, id: null, from: null };
}

export function resolveOrganization(row: {
  costumerOrganizationName: string | null;
  customerOrganizationId: string | null;
  company: string | null;
}): LeadOrganizationRef {
  if (row.costumerOrganizationName) {
    return {
      name: row.costumerOrganizationName,
      id: row.customerOrganizationId,
      from: "costumerOrganization",
    };
  }
  return { name: row.company, id: null, from: null };
}

export function resolveContact(
  row: { contactPhone: string | null; contactId: string | null; phoneNumber: string | null },
  canView: boolean,
): LeadContactRef {
  if (row.contactPhone) {
    return {
      phone: canView ? row.contactPhone : censorPhone(row.contactPhone),
      id: row.contactId,
      from: "contact",
    };
  }
  return { phone: row.phoneNumber, id: null, from: null };
}

export function resolveEmail(
  row: { costumerEmail: string | null; customerId: string | null; email: string | null },
  canView: boolean,
): LeadEmailRef {
  if (row.costumerEmail) {
    return {
      email: canView ? row.costumerEmail : censorEmail(row.costumerEmail),
      id: row.customerId,
      from: "costumer",
    };
  }
  return { email: row.email, id: null, from: null };
}

export interface LeadViewSource {
  id: string;
  leadNumber: string;
  name: string | null;
  company: string | null;
  phoneNumber: string | null;
  email: string | null;
  costumerName: string | null;
  costumerEmail: string | null;
  customerId: string | null;
  customerOrganizationId: string | null;
  costumerOrganizationName: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactId: string | null;
  ownerId: string | null;
  ownerName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  stage: LeadLead["stage"];
  source: LeadLead["source"];
  estimatedValue: number | null;
  wonAt: Date | null;
  lostAt: Date | null;
  stageChangedAt: Date | null;
  createdAt: Date;
}

export function toLeadView(row: LeadViewSource, actor: LeadActor): LeadLead {
  const canView = canViewLead(actor, row);
  return {
    id: row.id,
    leadNumber: row.leadNumber,
    costumer: resolveCostumer(row),
    organization: resolveOrganization(row),
    contacts: resolveContact(row, canView),
    email: resolveEmail(row, canView),
    stage: row.stage,
    source: row.source,
    ownerId: row.ownerId,
    ownerName: row.ownerName,
    assigneeId: row.assigneeId,
    assigneeName: row.assigneeName,
    estimatedValue: row.estimatedValue,
    wonAt: row.wonAt?.toISOString() ?? null,
    lostAt: row.lostAt?.toISOString() ?? null,
    stageChangedAt: row.stageChangedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export interface LeadDetailViewSource extends LeadViewSource {
  notes: string | null;
  updatedAt: Date;
  contactId: string | null;
  customerId: string | null;
  customerOrganizationId: string | null;
}

export function toLeadDetailView(
  row: LeadDetailViewSource,
  actor: LeadActor,
): LeadDetailView {
  const canUpdate = actor.role === "admin" || row.ownerId === actor.userId;
  return {
    ...toLeadView(row, actor),
    notes: row.notes,
    contactId: row.contactId,
    customerId: row.customerId,
    customerOrganizationId: row.customerOrganizationId,
    updatedAt: row.updatedAt.toISOString(),
    canUpdate,
    canDelete: actor.role === "admin",
  };
}