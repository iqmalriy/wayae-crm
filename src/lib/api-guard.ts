import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppError, type AppErrorCode } from "@/lib/errors";

export type AuthGuardResult =
  | { ok: true; session: typeof auth.$Infer.Session }
  | { ok: false; response: NextResponse };

export async function requireSession(
  request: Request,
): Promise<AuthGuardResult> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return { ok: false, response: unauthorizedResponse() };
  }
  return { ok: true, session };
}

export async function requireAdmin(
  request: Request,
): Promise<AuthGuardResult> {
  return requireRoles(request, "admin");
}

export async function requireAdminOrStaff(
  request: Request,
): Promise<AuthGuardResult> {
  return requireRoles(request, "admin", "staff");
}

async function requireRoles(
  request: Request,
  ...allowed: string[]
): Promise<AuthGuardResult> {
  const result = await requireSession(request);
  if (!result.ok) return result;

  if (!result.session.user.role || !allowed.includes(result.session.user.role)) {
    return { ok: false, response: errorResponse("FORBIDDEN", 403) };
  }
  return result;
}

function unauthorizedResponse(): NextResponse {
  return NextResponse.json(new AppError("UNAUTHORIZED").toBody(), {
    status: 401,
  });
}

function errorResponse(code: AppErrorCode, status: number): NextResponse {
  return NextResponse.json(new AppError(code).toBody(), { status });
}