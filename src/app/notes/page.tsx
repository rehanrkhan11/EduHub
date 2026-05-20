import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { NoteCard } from "@/components/notes/NoteCard";
import { NotesFilters } from "@/components/notes/NotesFilters";
import { UploadNoteButton } from "@/components/notes/UploadNoteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Class Notes",
  description: "Browse and download free class notes and study materials.",
};

interface SearchParams {
  subject?: string;
  semester?: string;
  q?: string;
  page?: string;
}

export default async function NotesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  const page = Number(searchParams.page ?? 1);
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(searchParams.subject && {
      subject: { contains: searchParams.subject, mode: "insensitive" as const },
    }),
    ...(searchParams.semester && { semester: searchParams.semester }),
    ...(searchParams.q && {
      OR: [
        { title: { contains: searchParams.q, mode: "insensitive" as const } },
        { subject: { contains: searchParams.q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [notes, total, subjects] = await Promise.all([
    prisma.noteFile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { uploader: { select: { name: true, image: true } } },
    }),
    prisma.noteFile.count({ where }),
    // Distinct subjects for filter dropdown
    prisma.noteFile.findMany({
      select: { subject: true },
      distinct: ["subject"],
      orderBy: { subject: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Class Notes</h1>
          <p className="mt-2 text-gray-500">{total} note{total !== 1 ? "s" : ""} available</p>
        </div>
        {session?.user && <UploadNoteButton />}
      </div>

      {!session?.user && (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          <a href="/login" className="font-semibold underline">Sign in</a> to download or upload notes.
        </div>
      )}

      <Suspense>
        <NotesFilters subjects={subjects.map((s) => s.subject)} />
      </Suspense>

      {notes.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <p className="text-lg">No notes found.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note as any} isAuthenticated={!!session?.user} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/notes?page=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
