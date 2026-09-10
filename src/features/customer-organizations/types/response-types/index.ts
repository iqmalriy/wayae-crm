export interface CustomerOrganizationView {
  id: string;
  name: string;
  legalName: string | null;
  organizationType: "enterprise" | "individual" | null;
  status: "prospect" | "active" | "churned";
  customerCount: number;
  activeCustomerCount: number;
  updatedAt: string;
}

export interface ListCustomerOrganizationsOutput {
  customerOrganizations: CustomerOrganizationView[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface CreateCustomerOrganizationOutput {
  customerOrganization: CustomerOrganizationView;
}

export interface CreateCustomerOrganizationResult
  extends CreateCustomerOrganizationOutput {
  message: string;
  status: 200 | 201;
}

export interface UpdateCustomerOrganizationOutput {
  customerOrganization: CustomerOrganizationView;
}

export interface UpdateCustomerOrganizationResult
  extends UpdateCustomerOrganizationOutput {
  message: string;
  status: 200;
}

export interface CustomerOrganizationDetailView {
  id: string;
  name: string;
  legalName: string | null;
  npwp: string | null;
  industry: string | null;
  address: string | null;
  organizationType: "enterprise" | "individual" | null;
  status: "prospect" | "active" | "churned";
  accountOwner: { id: string; name: string; email: string } | null;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  churnedAt: string | null;
  prospectAt: string | null;
}

export interface GetCustomerOrganizationOutput {
  customerOrganization: CustomerOrganizationDetailView;
}