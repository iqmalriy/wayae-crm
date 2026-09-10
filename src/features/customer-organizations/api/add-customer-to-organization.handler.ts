import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { addCustomerToOrganizationInput } from "../schemas/add-customer-to-organization.schema";
import { addCustomerToOrganizationForUser } from "../services/add-customer-to-organization.service";

export async function addCustomerToOrganizationHandler(
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

  const parsed = addCustomerToOrganizationInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await addCustomerToOrganizationForUser(id, parsed.data);
    return NextResponse.json(
      ok({ customer: output.customer }, "Customer added to organization."),
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}