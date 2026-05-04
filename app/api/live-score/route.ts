import { NextResponse } from "next/server";
import { getLiveScoreData } from "@/lib/live-score";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getLiveScoreData();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
