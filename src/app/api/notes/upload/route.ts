import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPresignedUploadUrl } from "@/lib/storage";
import { z } from "zod";
import { ALLOWED_FILE_TYPES } from "@/lib/validations";

const schema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum(ALLOWED_FILE_TYPES),
});

// POST /api/notes/upload
// Returns a short-lived presigned PUT URL. The client uploads directly to S3.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { uploadUrl, fileKey, publicUrl } = await createPresignedUploadUrl({
    ...parsed.data,
    userId: session.user.id,
  });

  return NextResponse.json({ data: { uploadUrl, fileKey, publicUrl } });
}
