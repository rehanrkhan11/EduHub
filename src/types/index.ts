import type { Role } from "@prisma/client";

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export type JobType = "full-time" | "part-time" | "contract" | "remote";

export interface Job {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  type: JobType;
  description: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobListItem
  extends Pick<Job, "id" | "title" | "slug" | "company" | "location" | "type" | "tags" | "createdAt"> {}

export interface CreateJobInput {
  title: string;
  company: string;
  location: string;
  type: JobType;
  description: string;
  tags: string[];
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export interface NoteFile {
  id: string;
  uploaderId: string;
  title: string;
  subject: string;
  semester: string | null;
  fileKey: string;
  fileUrl: string;
  downloadCount: number;
  createdAt: Date;
  uploader: { name: string | null; image: string | null };
}

export interface CreateNoteInput {
  title: string;
  subject: string;
  semester?: string;
  fileName: string;
  fileType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
