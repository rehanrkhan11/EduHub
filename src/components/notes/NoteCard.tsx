import type { NoteFile } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface NoteCardProps {
  note: NoteFile & { uploader: { name: string | null; image: string | null } };
  isAuthenticated: boolean;
}

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  png: "🖼️",
  jpg: "🖼️",
  jpeg: "🖼️",
};

function getExt(fileKey: string) {
  return fileKey.split(".").pop()?.toLowerCase() ?? "file";
}

export function NoteCard({ note, isAuthenticated }: NoteCardProps) {
  const ext = getExt(note.fileKey);
  const icon = FILE_ICONS[ext] ?? "📎";

  return (
    <div className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900 line-clamp-2">{note.title}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{note.subject}</p>
        </div>
      </div>

      {note.semester && (
        <div className="mt-3">
          <Badge variant="secondary">{note.semester}</Badge>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>⬇️ {note.downloadCount}</span>
          <span>·</span>
          <span>{note.uploader.name ?? "Anonymous"}</span>
        </div>

        {isAuthenticated ? (
          <a
            href={`/api/notes/${note.id}`}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            download
          >
            Download
          </a>
        ) : (
          <a
            href="/login"
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Sign in to download
          </a>
        )}
      </div>
    </div>
  );
}
