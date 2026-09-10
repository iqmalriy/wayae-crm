import { authClient } from "@/lib/auth-client";

export type UserRole = "admin" | "staff";

export function useRole() {
  const { data: sessionData } = authClient.useSession();
  const role = (sessionData?.user?.role ?? null) as UserRole | null;

  function can(...allowed: UserRole[]) {
    return role !== null && allowed.includes(role);
  }

  function is(roleToCheck: UserRole) {
    return role === roleToCheck;
  }

  return { role, can, is };
}
