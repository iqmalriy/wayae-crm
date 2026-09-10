import { isNull } from "drizzle-orm";
import { verifyPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { waAccounts } from "@/lib/db/schema";

export interface TokenAccount {
  id: string;
  phone: string;
}

export async function findActiveByToken(
  token: string,
): Promise<TokenAccount | null> {
  const candidates = await db
    .select({
      id: waAccounts.id,
      phone: waAccounts.phone,
      tokenHash: waAccounts.tokenHash,
    })
    .from(waAccounts)
    .where(isNull(waAccounts.deletedAt));

  for (const account of candidates) {
    const matches = await verifyPassword({
      hash: account.tokenHash,
      password: token,
    });
    if (matches) {
      return { id: account.id, phone: account.phone };
    }
  }
  return null;
}