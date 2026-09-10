import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireSession } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { deleteCustomerForUser } from "../services/delete-customer.service";

export async function deleteCustomerHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await deleteCustomerForUser(id, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin" | "staff",
    });
    return NextResponse.json(ok({ deleted: output.deleted }, output.message));
  } catch (error) {
    return toErrorResponse(error);
  }
}