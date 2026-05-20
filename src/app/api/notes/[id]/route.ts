import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPresignedDownloadUrl } from "@/lib/storage";

type Params = { params: { id: string } };

// GET /api/notes/[id] — redirect to a presigned download URL
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized — please sign in to download" }, { status: 401 });
  }

  const note = await prisma.noteFile.findUnique({ where: { id: params.id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Record download (upsert prevents duplicate rows; Prisma handles the unique constraint)
  await prisma.$transaction([
    prisma.download.upsert({
      where: { userId_noteId: { userId: session.user.id, noteId: note.id } },
      create: { userId: session.user.id, noteId: note.id },
      update: { downloadedAt: new Date() },
    }),
    prisma.noteFile.update({
      where: { id: note.id },
      data: { downloadCount: { increment: 1 } },
    }),
  ]);

  const downloadUrl = await createPresignedDownloadUrl(note.fileKey);

  // 302 redirect — browser follows it immediately and starts the download
  return NextResponse.redirect(downloadUrl, 302);
}

// DELETE /api/notes/[id] — owner or admin can remove
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.noteFile.findUnique({ where: { id: params.id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = note.uploaderId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // DB record deleted first; S3 cleanup in background (or via a job queue)
  await prisma.noteFile.delete({ where: { id: params.id } });

  // Fire-and-forget S3 delete (don't await — keeps response fast)
  const { deleteFile } = await import("@/lib/storage");
  deleteFile(note.fileKey).catch(console.error);

  return NextResponse.json({ message: "Deleted" });
}
