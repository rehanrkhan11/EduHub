import Link from "next/link";
import type { JobListItem } from "@/types";
import { Badge } from "@/components/ui/Badge";

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  remote: "Remote",
};

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "success" | "warning"> = {
  "full-time": "default",
  "part-time": "warning",
  contract: "secondary",
  remote: "success",
};

interface JobCardProps {
  job: JobListItem;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:ring-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {job.title}
          </h2>
          <p className="mt-0.5 truncate text-sm text-gray-500">{job.company}</p>
        </div>
        <Badge variant={TYPE_VARIANTS[job.type] ?? "secondary"}>
          {TYPE_LABELS[job.type] ?? job.type}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
        <span>📍</span>
        <span className="truncate">{job.location}</span>
      </div>

      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="text-xs text-gray-400">+{job.tags.length - 4}</span>
          )}
        </div>
      )}

      <p className="mt-auto pt-3 text-xs text-gray-400">
        {new Date(job.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </Link>
  );
}
