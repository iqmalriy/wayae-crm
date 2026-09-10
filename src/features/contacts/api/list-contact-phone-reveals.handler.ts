import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { listContactPhoneRevealsForUser } from "../services/list-contact-phone-reveals.service";

export async function listContactPhoneRevealsHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await listContactPhoneRevealsForUser(id);
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}