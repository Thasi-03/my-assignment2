import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const items = await prisma.result.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { player, timeSec, score, stages } = await req.json();
  if (!player || timeSec == null || score == null || stages == null) {
    return NextResponse.json({ error: "player, timeSec, score, stages required" }, { status: 400 });
  }
  const created = await prisma.result.create({ data: { player, timeSec, score, stages } });
  return NextResponse.json(created, { status: 201 });
}
