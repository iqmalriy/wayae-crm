import {
  updateWaAccountLabelHandler,
  refreshWaAccountTokenHandler,
  deleteWaAccountHandler,
} from "@/features/wa-accounts";

export const PATCH = updateWaAccountLabelHandler;
export const POST = refreshWaAccountTokenHandler;
export const DELETE = deleteWaAccountHandler;