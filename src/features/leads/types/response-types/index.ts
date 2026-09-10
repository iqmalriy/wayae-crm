import type { LeadStage, LeadSource } from "@/lib/db/schema";
import type { TaskPriority, TaskStatus } from "@/lib/db/schema";

export interface LeadCostumerRef {
  name: string | null;
  id: string | null;
  from: "costumer" | "contact" | null;
}

export interface LeadOrganizationRef {
  name: string | null;
  id: string | null;
  from: "costumerOrganization" | null;
}

export interface LeadContactRef {
  phone: string | null;
  id: string | null;
  from: "contact" | null;
}

export interface LeadEmailRef {
  email: string | null;
  id: string | null;
  from: "costumer" | null;
}

export interface LeadLead {
  id: string;
  leadNumber: string;
  costumer: LeadCostumerRef;
  organization: LeadOrganizationRef;
  contacts: LeadContactRef;
  email: LeadEmailRef;

  stage: LeadStage;
  source: LeadSource;

  ownerId: string | null;
  ownerName: string | null;

  assigneeId: string | null;
  assigneeName: string | null;

  estimatedValue: number | null;

  wonAt: string | null;
  lostAt: string | null;
  stageChangedAt: string | null;
  createdAt: string;
}

export interface ListLeadsOutput {
  leads: LeadLead[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface CreateLeadOutput {
  lead: LeadLead;
}

export interface LeadDetailView extends LeadLead {
  notes: string | null;
  contactId: string | null;
  customerId: string | null;
  customerOrganizationId: string | null;
  updatedAt: string;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface GetLeadOutput {
  lead: LeadDetailView;
}

export interface UpdateLeadOutput {
  lead: LeadDetailView;
}

export interface UpdateLeadResult extends UpdateLeadOutput {
  message: string;
  status: 200;
}

export interface ChangeLeadStageOutput {
  lead: LeadDetailView;
}

export interface ChangeLeadStageResult extends ChangeLeadStageOutput {
  message: string;
  status: 200;
}

export interface LeadActivityView {
  id: string;
  body: string | null;
  performedById: string | null;
  performedByName: string | null;
  fromStage: LeadStage | null;
  toStage: LeadStage | null;
  createdAt: string;
}

export interface ListLeadActivitiesOutput {
  activities: LeadActivityView[];
}

export interface CreateLeadActivityOutput {
  activity: LeadActivityView;
}

export interface TaskView {
  id: string;
  leadId: string;
  leadNumber: string | null;
  leadName: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  createdById: string | null;
  createdByName: string | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskOutput {
  task: TaskView;
}

export interface ListTasksOutput {
  columns: Record<TaskStatus, TaskView[]>;
  total: number;
}