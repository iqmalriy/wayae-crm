import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword, generateRandomString } from "better-auth/crypto";
import { db } from "../lib/db";
import { user, account } from "../lib/db/schemas/auth.schema";

const name = process.env.SEED_ADMIN_NAME ?? "Admin";
const email = process.env.SEED_ADMIN_EMAIL ?? "admin@wayae.com";
const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";

async function seedAdmin() {
  const passwordHash = await hashPassword(password);

  const existing = await db.select().from(user).where(eq(user.email, email));

  if (existing.length > 0) {
    await db
      .update(user)
      .set({ role: "admin", emailVerified: true })
      .where(eq(user.email, email));
    console.log(`Admin "${email}" updated (role: admin).`);
    return;
  }

  const userId = `user_${generateRandomString(24, "a-z", "0-9")}`;

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      role: "admin",
    });

    await tx.insert(account).values({
      id: randomUUID(),
      issuer: "local:credential",
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    });
  });

  console.log(`Admin "${email}" created (role: admin).`);
}

seedAdmin()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());