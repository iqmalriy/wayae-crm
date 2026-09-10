import {
  createCustomerHandler,
  listCustomersHandler,
} from "@/features/customers";

export const GET = listCustomersHandler;
export const POST = createCustomerHandler;