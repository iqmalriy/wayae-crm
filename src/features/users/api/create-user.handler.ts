import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { createUserInput } from "../schemas/create-user.schema";
import { createUserForAdmin } from "../services/create-user.service";

export async function createUserHandler(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), {
      status: 400,
    });
  }

  const parsed = createUserInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await createUserForAdmin(parsed.data);
    return NextResponse.json(ok(output, "User created."), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}