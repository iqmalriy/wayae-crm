import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { revealContactPhoneInput } from "../schemas/reveal-contact-phone.schema";
import { revealContactPhoneForUser } from "../services/reveal-contact-phone.service";

export async function revealContactPhoneHandler(
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

  const parsed = revealContactPhoneInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await revealContactPhoneForUser(
      id,
      {
        userId: guard.session.user.id,
        role: guard.session.user.role as "admin" | "staff",
      },
      parsed.data,
    );
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}