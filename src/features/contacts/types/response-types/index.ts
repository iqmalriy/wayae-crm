export interface ContactView {
  id: string;
  phone: string;
  displayName: string;
  source: "inbound" | "manual";
  costumers: { id: string; fullName: string } | null;
  canDetach: boolean;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface ListContactsOutput {
  contacts: ContactView[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface CreateContactOutput {
  contact: ContactView;
}

export interface CreateContactResult extends CreateContactOutput {
  message: string;
  status: 200 | 201;
}

export interface UpdateContactOutput {
  contact: ContactView;
}

export interface UpdateContactResult extends UpdateContactOutput {
  message: string;
  status: 200;
}

export interface ContactCustomerBrief {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string | null;
  status: "active" | "inactive";
  organizationId: string | null;
  organizationName: string | null;
  isDecisionMaker: boolean;
}

export interface ContactDetailView {
  id: string;
  phone: string;
  displayName: string;
  description: string | null;
  isBusiness: boolean;
  source: "inbound" | "manual";
  waIdType: "c_us" | "lid" | "unknown" | null;
  addedById: string | null;
  addedByName: string | null;
  allowedUpdate: boolean;
  allowedRevealPhone: boolean;
  isAdmin: boolean;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  customer: ContactCustomerBrief | null;
}

export interface GetContactOutput {
  contact: ContactDetailView;
}

export interface PhoneRevealView {
  id: string;
  userId: string | null;
  userName: string | null;
  role: string | null;
  reason: string | null;
  revealedAt: string;
}

export interface ListPhoneRevealsOutput {
  reveals: PhoneRevealView[];
}