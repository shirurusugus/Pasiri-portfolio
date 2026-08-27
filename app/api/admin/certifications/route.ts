import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CertificationSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const certs = await prisma.certification.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ certs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parseResult = CertificationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const created = await prisma.certification.create({
      data: {
        ...parseResult.data,
        issueDate: new Date(parseResult.data.issueDate),
        expirationDate: parseResult.data.expirationDate ? new Date(parseResult.data.expirationDate) : null,
      },
    });

    return NextResponse.json({ success: true, cert: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create cert" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = body;

    const parseResult = CertificationSchema.safeParse(data);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const updated = await prisma.certification.update({
      where: { id },
      data: {
        ...parseResult.data,
        issueDate: new Date(parseResult.data.issueDate),
        expirationDate: parseResult.data.expirationDate ? new Date(parseResult.data.expirationDate) : null,
      },
    });

    return NextResponse.json({ success: true, cert: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update cert" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.certification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete cert" }, { status: 500 });
  }
}
