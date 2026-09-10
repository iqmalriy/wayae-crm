import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireSession } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { listWaAccountStatusForSession } from "../services/list-wa-account-status.service";

export async function listWaAccountStatusHandler(request: Request) {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  try {
    const output = await listWaAccountStatusForSession();
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}