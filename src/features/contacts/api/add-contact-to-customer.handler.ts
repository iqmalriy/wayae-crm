import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { addContactToCustomerInput } from "../schemas/add-contact-to-customer.schema";
import { addContactToCustomerForUser } from "../services/add-contact-to-customer.service";

export async function addContactToCustomerHandler(
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

  const parsed = addContactToCustomerInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await addContactToCustomerForUser(id, parsed.data);
    return NextResponse.json(
      ok({ contact: output.contact }, "Contact added to customer."),
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}