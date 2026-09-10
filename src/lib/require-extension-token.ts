import { NextResponse } from "next/server";

export type ExtensionTokenGuardResult =
  | { ok: true; token: string }
  | { ok: false; response: NextResponse };

export async function extractBearerToken(
  request: Request,
): Promise<ExtensionTokenGuardResult> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return { ok: false, response: new NextResponse(null, { status: 401 }) };
  }

  return { ok: true, token };
}