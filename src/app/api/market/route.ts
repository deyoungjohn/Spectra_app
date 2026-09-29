import { NextResponse } from "next/server";
import { getMarketDataset } from "@/core/market-data";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getMarketDataset()); }
