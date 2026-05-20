import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildJobMetadata, jobPostingSchema } from "@/lib/seo";
import { Badge } from "@/components/ui/Badge";

export const revalidate = 3600;

// Pre-generate top 100 jobs at build time
export async function generateStaticParams() {
  const jobs = await prisma.job.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return jobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const job = await prisma.job.findUnique({ where: { slug: params.slug } });
  if (!job) return {};
  return buildJobMetadata(job);
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const job = await prisma.job.findUnique({
    where: { slug: params.slug, published: true },
    include: { author: { select: { name: true } } },
  });

  if (!job) notFound();

  const schema = jobPostingSchema(job as any);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-lg text-indigo-600 font-medium">{job.company}</p>
            </div>
            <a
              href="#apply"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Apply now
            </a>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">📍 {job.location}</span>
            <span className="flex items-center gap-1">🕒 {job.type}</span>
            <span className="flex items-center gap-1">📅 {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Job Description</h2>
          <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>
      </article>
    </>
  );
}
