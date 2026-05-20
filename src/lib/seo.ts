import type { Metadata } from "next";
import type { Job } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "EduHub";
const SITE_DESCRIPTION =
  "Find jobs and download class notes — all in one place.";

// ─── Base metadata (inherited by all pages) ──────────────────────────────────

export const baseMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-default.png"],
  },
  robots: { index: true, follow: true },
};

// ─── Per-page builders ───────────────────────────────────────────────────────

export function buildJobMetadata(job: Pick<Job, "title" | "company" | "location" | "description" | "slug">): Metadata {
  const title = `${job.title} at ${job.company}`;
  const description = job.description.slice(0, 155) + "…";
  const url = `${BASE_URL}/jobs/${job.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [{ url: `/api/og?title=${encodeURIComponent(title)}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  };
}

export function buildNotesMetadata(subject: string): Metadata {
  const title = `${subject} Notes`;
  const description = `Download free class notes and study materials for ${subject}.`;
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `${BASE_URL}/notes?subject=${encodeURIComponent(subject)}` },
  };
}

// ─── JSON-LD Schemas ─────────────────────────────────────────────────────────

export function jobPostingSchema(job: Job) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location },
    },
    employmentType: job.type.toUpperCase().replace("-", "_"),
    datePosted: job.createdAt.toISOString(),
    url: `${BASE_URL}/jobs/${job.slug}`,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/jobs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
