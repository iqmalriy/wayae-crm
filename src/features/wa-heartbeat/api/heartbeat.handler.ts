import { NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/require-extension-token";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { heartbeatInput } from "../schemas/heartbeat.schema";
import { recordHeartbeat } from "../services/heartbeat.service";

export async function heartbeatHandler(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), {
      status: 400,
    });
  }

  const parsed = heartbeatInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  const guard = await extractBearerToken(request);
  if (!guard.ok) return guard.response;

  try {
    const output = await recordHeartbeat(guard.token, parsed.data);
    return NextResponse.json(output);
  } catch (error) {
    return toErrorResponse(error);
  }
}