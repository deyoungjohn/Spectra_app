import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ status: "ok", mode: process.env.MARKET_DATA_MODE === "live" ? "live" : "demo", execution: false, weekendPremium: false }); }
