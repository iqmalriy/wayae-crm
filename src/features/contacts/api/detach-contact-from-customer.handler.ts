import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { detachContactFromCustomerForUser } from "../services/detach-contact-from-customer.service";

export async function detachContactFromCustomerHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await detachContactFromCustomerForUser(id, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin" | "staff",
    });
    return NextResponse.json(
      ok({ contact: output.contact }, "Contact detached from customer."),
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}