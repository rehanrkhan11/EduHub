import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Please enter a valid email address"),
});

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const JOB_TYPES = ["full-time", "part-time", "contract", "remote"] as const;

export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  company: z.string().min(1, "Company name is required").max(100),
  location: z.string().min(1, "Location is required").max(100),
  type: z.enum(JOB_TYPES, { errorMap: () => ({ message: "Invalid job type" }) }),
  description: z.string().min(50, "Description must be at least 50 characters").max(10000),
  tags: z
    .array(z.string().max(30))
    .max(10, "Maximum 10 tags")
    .default([]),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

// ─── Notes ───────────────────────────────────────────────────────────────────

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
] as const;

export const createNoteSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  subject: z.string().min(1, "Subject is required").max(100),
  semester: z.string().max(20).optional(),
  fileName: z.string().min(1),
  fileType: z.enum(ALLOWED_FILE_TYPES, {
    errorMap: () => ({ message: "File type not allowed. Upload PDF, Word, PNG, or JPEG." }),
  }),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

// ─── Query params ────────────────────────────────────────────────────────────

export const jobsQuerySchema = z.object({
  q: z.string().max(100).optional(),
  type: z.enum(JOB_TYPES).optional(),
  location: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const notesQuerySchema = z.object({
  subject: z.string().max(100).optional(),
  semester: z.string().max(20).optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});
