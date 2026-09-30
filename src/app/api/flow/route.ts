import { NextResponse } from "next/server";
import { getFlowDataset } from "@/core/flow-data";

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getFlowDataset()); }
