import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireSession } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { detachCustomerFromOrgForUser } from "../services/detach-customer-from-org.service";

export async function detachCustomerFromOrgHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await detachCustomerFromOrgForUser(id, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin" | "staff",
    });
    return NextResponse.json(
      ok({ customer: output.customer }, "Customer detached from organization."),
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}