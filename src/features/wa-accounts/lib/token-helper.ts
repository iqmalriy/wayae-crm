import { generateRandomString, hashPassword } from "better-auth/crypto";

export async function generateBearerToken(): Promise<{
  token: string;
  tokenHash: string;
}> {
  const token = `wag_${generateRandomString(32, "a-z", "A-Z", "0-9")}`;
  const tokenHash = await hashPassword(token);
  return { token, tokenHash };
}