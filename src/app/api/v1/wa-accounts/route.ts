import {
  createWaAccountHandler,
  listWaAccountsHandler,
} from "@/features/wa-accounts";

export const POST = createWaAccountHandler;
export const GET = listWaAccountsHandler;