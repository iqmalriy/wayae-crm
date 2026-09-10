import { NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/require-extension-token";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { eventsInput } from "../schemas/events.schema";
import { processEvents } from "../services/events.service";
import { findActiveByToken } from "@/features/wa-heartbeat/repositories/wa-token.repository";

export async function eventsHandler(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), {
      status: 400,
    });
  }

  const parsed = eventsInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  const guard = await extractBearerToken(request);
  if (!guard.ok) return guard.response;

  const account = await findActiveByToken(guard.token);
  if (!account) {
    return NextResponse.json(new AppError("UNAUTHORIZED").toBody(), {
      status: 401,
    });
  }

  try {
    const output = await processEvents(account.id, parsed.data);
    return NextResponse.json(output);
  } catch (error) {
    return toErrorResponse(error);
  }
}