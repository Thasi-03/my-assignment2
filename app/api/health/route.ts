import { NextResponse } from "next/server";

export async function GET() {
  const t0 = performance.now();
  // do a tiny bit of work to show timing
  await new Promise(r => setTimeout(r, 5));
  const t1 = performance.now();
  return NextResponse.json(
    { ok: true, time: new Date().toISOString(), latencyMs: +(t1 - t0).toFixed(2) },
    { status: 200 }
  );
}
