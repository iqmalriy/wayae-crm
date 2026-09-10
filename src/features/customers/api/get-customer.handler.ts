import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { getCustomerForUser } from "../services/get-customer.service";

export async function getCustomerHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await getCustomerForUser(id, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin" | "staff",
    });
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}