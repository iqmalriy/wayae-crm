import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { updateCustomerOrganizationInput } from "../schemas/update-customer-organization.schema";
import { updateCustomerOrganizationForUser } from "../services/update-customer-organization.service";

export async function updateCustomerOrganizationHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), {
      status: 400,
    });
  }

  const parsed = updateCustomerOrganizationInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await updateCustomerOrganizationForUser(
      id,
      {
        userId: guard.session.user.id,
        role: guard.session.user.role as "admin" | "staff",
      },
      parsed.data,
    );
    return NextResponse.json(
      ok(
        { customerOrganization: output.customerOrganization },
        output.message,
      ),
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}