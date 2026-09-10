import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { softDeleteCustomerOrganizationForUser } from "../services/delete-customer-organization.service";

export async function deleteCustomerOrganizationHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await softDeleteCustomerOrganizationForUser(id, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin",
    });
    return NextResponse.json(ok({}, output.message), { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}