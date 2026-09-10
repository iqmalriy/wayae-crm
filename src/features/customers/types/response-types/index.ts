export interface CustomerView {
  id: string;
  fullName: string;
  jobTitle: string | null;
  status: "active" | "inactive";
  organizationId: string | null;
  organizationName: string | null;
  isDecisionMaker: boolean;
  isPrimaryContact: boolean;
  canDetach: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListCustomersOutput {
  customers: CustomerView[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface CreateCustomerOutput {
  customer: CustomerView;
}

export interface CreateCustomerResult extends CreateCustomerOutput {
  message: string;
  status: 200 | 201;
}

export interface CustomerDetailView {
  id: string;
  fullName: string;
  email: string | null;
  jobTitle: string | null;
  notes: string | null;
  status: "active" | "inactive";
  organizationId: string | null;
  organizationName: string | null;
  isDecisionMaker: boolean;
  isPrimaryContact: boolean;
  createdById: string | null;
  createdByName: string | null;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetCustomerOutput {
  customer: CustomerDetailView;
}

export interface UpdateCustomerOutput {
  customer: CustomerView;
}

export interface UpdateCustomerResult extends UpdateCustomerOutput {
  message: string;
  status: 200;
}