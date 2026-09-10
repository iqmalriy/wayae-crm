import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoVerifyEmail: true,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "staff",
        input: false,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;

      const email = ctx.body?.email as string | undefined;
      if (!email) return;

      const [row] = await db
        .select({ deletedAt: schema.user.deletedAt })
        .from(schema.user)
        .where(eq(schema.user.email, email))
        .limit(1);

      if (row?.deletedAt) {
        throw new APIError("UNAUTHORIZED", {
          message: "This account has been disabled.",
        });
      }
    }),
  },
});
