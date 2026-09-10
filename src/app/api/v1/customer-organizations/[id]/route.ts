import {
  getCustomerOrganizationHandler,
  updateCustomerOrganizationHandler,
  deleteCustomerOrganizationHandler,
} from "@/features/customer-organizations";

export const GET = getCustomerOrganizationHandler;
export const PATCH = updateCustomerOrganizationHandler;
export const DELETE = deleteCustomerOrganizationHandler;