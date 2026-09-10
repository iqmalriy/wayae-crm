import {
  getLeadHandler,
  updateLeadHandler,
  deleteLeadHandler,
} from "@/features/leads";

export const GET = getLeadHandler;
export const PATCH = updateLeadHandler;
export const DELETE = deleteLeadHandler;