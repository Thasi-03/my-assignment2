import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json(); // { player?, timeSec?, score?, stages? }
  const updated = await prisma.result.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.result.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
