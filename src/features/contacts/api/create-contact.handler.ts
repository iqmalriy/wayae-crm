import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { ContactAlreadyExistsError } from "../api-error/errors";
import { createContactInput } from "../schemas/create-contact.schema";
import { createContactForUser } from "../services/create-contact.service";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

export async function createContactHandler(request: Request) {
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

  const parsed = createContactInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await createContactForUser(parsed.data, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin" | "staff",
    });
    return NextResponse.json(
      ok({ contact: output.contact }, output.message),
      { status: output.status },
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      const conflict = new ContactAlreadyExistsError();
      return NextResponse.json(conflict.toBody(), { status: conflict.status });
    }
    return toErrorResponse(error);
  }
}