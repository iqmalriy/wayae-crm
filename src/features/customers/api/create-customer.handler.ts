import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { createCustomerInput } from "../schemas/create-customer.schema";
import { createCustomerForUser } from "../services/create-customer.service";

export async function createCustomerHandler(request: Request) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), {
      status: 400,
    });
  }

  const parsed = createCustomerInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await createCustomerForUser(parsed.data, {
      userId: guard.session.user.id,
    });
    return NextResponse.json(
      ok({ customer: output.customer }, output.message),
      { status: output.status },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}