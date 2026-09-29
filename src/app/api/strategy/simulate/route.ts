import { NextResponse } from "next/server";
import { replayStrategy } from "@/core/strategy-data";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid simulation request." }, { status: 400 });
  const { templateId, haltAfterFrame } = body as Record<string, unknown>;
  if (typeof templateId !== "string" || (haltAfterFrame !== undefined && (!Number.isSafeInteger(haltAfterFrame) || Number(haltAfterFrame) < 0))) return NextResponse.json({ error: "Invalid simulation parameters." }, { status: 400 });
  try { return NextResponse.json(replayStrategy(templateId, haltAfterFrame === undefined ? undefined : Number(haltAfterFrame))); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Simulation failed." }, { status: 400 }); }
}
