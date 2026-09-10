import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { createTaskInput } from "../schemas/create-task.schema";
import { createTaskForUser } from "../services/create-task.service";

export async function createTaskHandler(request: Request) {
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

  const parsed = createTaskInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await createTaskForUser(
      {
        userId: guard.session.user.id,
        role,
        name: guard.session.user.name,
      },
      parsed.data,
    );
    return NextResponse.json(ok(output), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}