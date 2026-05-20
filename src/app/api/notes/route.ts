import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNoteSchema, notesQuerySchema } from "@/lib/validations";
import { buildPublicUrl } from "@/lib/storage";

// ─── GET /api/notes ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = notesQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!query.success) {
    return NextResponse.json({ error: query.error.flatten() }, { status: 400 });
  }

  const { subject, semester, q, page, pageSize } = query.data;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(subject && { subject: { contains: subject, mode: "insensitive" as const } }),
    ...(semester && { semester }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { subject: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.noteFile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { uploader: { select: { name: true, image: true } } },
    }),
    prisma.noteFile.count({ where }),
  ]);

  return NextResponse.json({
    data: { items, total, page, pageSize, hasMore: skip + items.length < total },
  });
}

// ─── POST /api/notes ──────────────────────────────────────────────────────────
// Called AFTER the client has successfully uploaded to S3.
// Body: { title, subject, semester, fileKey }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Validate metadata fields
  const metaParsed = createNoteSchema.safeParse(body);
  if (!metaParsed.success) {
    return NextResponse.json({ error: metaParsed.error.flatten() }, { status: 422 });
  }

  if (!body.fileKey || typeof body.fileKey !== "string") {
    return NextResponse.json({ error: "fileKey is required" }, { status: 422 });
  }

  const { title, subject, semester } = metaParsed.data;
  const fileKey: string = body.fileKey;

  const note = await prisma.noteFile.create({
    data: {
      uploaderId: session.user.id,
      title,
      subject,
      semester: semester ?? null,
      fileKey,
      fileUrl: buildPublicUrl(fileKey),
    },
  });

  return NextResponse.json({ data: note }, { status: 201 });
}
