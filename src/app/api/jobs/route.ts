import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createJobSchema, jobsQuerySchema } from "@/lib/validations";
import slugify from "slugify";
import { randomUUID } from "crypto";

// ─── GET /api/jobs ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = jobsQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!query.success) {
    return NextResponse.json({ error: query.error.flatten() }, { status: 400 });
  }

  const { q, type, location, page, pageSize } = query.data;
  const skip = (page - 1) * pageSize;

  const where = {
    published: true,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { company: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(type && { type }),
    ...(location && { location: { contains: location, mode: "insensitive" as const } }),
  };

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        company: true,
        location: true,
        type: true,
        tags: true,
        createdAt: true,
      },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    data: { items, total, page, pageSize, hasMore: skip + items.length < total },
  });
}

// ─── POST /api/jobs ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { title, company, location, type, description, tags } = parsed.data;

  // Unique slug with collision guard
  const baseSlug = slugify(`${title}-${company}`, { lower: true, strict: true });
  const slug = `${baseSlug}-${randomUUID().slice(0, 6)}`;

  const job = await prisma.job.create({
    data: {
      authorId: session.user.id,
      title,
      slug,
      company,
      location,
      type,
      description,
      tags,
      published: session.user.role === "ADMIN", // Admins auto-publish
    },
  });

  return NextResponse.json({ data: job }, { status: 201 });
}
