import { createLeadHandler, listLeadsHandler } from "@/features/leads";

export const GET = listLeadsHandler;
export const POST = createLeadHandler;