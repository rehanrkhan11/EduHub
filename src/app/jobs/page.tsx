import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";

export const revalidate = 3600; // ISR — regenerate every hour

export const metadata: Metadata = {
  title: "Job Board",
  description: "Browse the latest job listings. Filter by type, location, and more.",
};

interface SearchParams {
  q?: string;
  type?: string;
  location?: string;
  page?: string;
}

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page ?? 1);
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  const where = {
    published: true,
    ...(searchParams.q && {
      OR: [
        { title: { contains: searchParams.q, mode: "insensitive" as const } },
        { company: { contains: searchParams.q, mode: "insensitive" as const } },
      ],
    }),
    ...(searchParams.type && { type: searchParams.type }),
    ...(searchParams.location && {
      location: { contains: searchParams.location, mode: "insensitive" as const },
    }),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, company: true, location: true, type: true, tags: true, createdAt: true },
    }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Job Board</h1>
        <p className="mt-2 text-gray-500">{total} open position{total !== 1 ? "s" : ""}</p>
      </div>

      <Suspense>
        <JobFilters />
      </Suspense>

      {jobs.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <p className="text-lg">No jobs found matching your criteria.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/jobs?page=${p}`}
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
