import {
  createCustomerOrganizationHandler,
  listCustomerOrganizationsHandler,
} from "@/features/customer-organizations";

export const GET = listCustomerOrganizationsHandler;
export const POST = createCustomerOrganizationHandler;