import {
  getCustomerHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
} from "@/features/customers";

export const GET = getCustomerHandler;
export const PATCH = updateCustomerHandler;
export const DELETE = deleteCustomerHandler;