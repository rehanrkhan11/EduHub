import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

// ─── Sample data ──────────────────────────────────────────────────────────────

const USERS = [
  {
    name: "Admin User",
    email: "admin@eduhub.dev",
    role: "ADMIN" as const,
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@eduhub.dev",
    role: "USER" as const,
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma@eduhub.dev",
    role: "USER" as const,
  },
];

const JOBS = [
  {
    title: "Frontend Developer Intern",
    company: "Nexlify Technologies",
    location: "Remote",
    type: "remote",
    description:
      "We're looking for a Frontend Developer Intern with a strong grasp of React and Tailwind CSS. You'll work closely with our design and product teams to build responsive, accessible interfaces for our education platform used by over 50,000 students.",
    tags: ["react", "tailwind", "internship", "frontend"],
    published: true,
  },
  {
    title: "Backend Engineer (Node.js)",
    company: "Codeverse Labs",
    location: "Bengaluru, India",
    type: "full-time",
    description:
      "Codeverse Labs is hiring a Backend Engineer to design and maintain scalable APIs using Node.js, PostgreSQL, and Prisma. Experience with authentication systems, queues, and cloud storage (S3) is a strong plus. You'll own services end to end.",
    tags: ["nodejs", "postgresql", "prisma", "backend"],
    published: true,
  },
  {
    title: "Content Writer - EdTech",
    company: "BrightPath Learning",
    location: "Remote",
    type: "part-time",
    description:
      "BrightPath Learning needs a part-time content writer to create engaging study notes, blog articles, and exam-prep guides for college students. Strong writing skills and familiarity with SEO best practices are required for this role.",
    tags: ["content", "writing", "seo", "part-time"],
    published: true,
  },
  {
    title: "Data Analyst Trainee",
    company: "Insightful Analytics",
    location: "Pune, India",
    type: "contract",
    description:
      "Join our analytics team as a Data Analyst Trainee. You'll clean datasets, build dashboards, and support decision-making using SQL, Excel, and Python. This is a 6-month contract role with a strong possibility of full-time conversion.",
    tags: ["sql", "python", "analytics", "trainee"],
    published: true,
  },
  {
    title: "UI/UX Design Intern",
    company: "Nexlify Technologies",
    location: "Hyderabad, India",
    type: "part-time",
    description:
      "We are looking for a creative UI/UX Design Intern to help redesign our student dashboard. Familiarity with Figma, design systems, and user research fundamentals is expected. Great opportunity to build a real-world portfolio.",
    tags: ["figma", "design", "ux", "internship"],
    published: false, // pending admin approval — demonstrates unpublished state
  },
];

const NOTES = [
  {
    title: "Data Structures & Algorithms - Complete Notes",
    subject: "Computer Science",
    semester: "3rd Semester",
    fileKey: "notes/seed/dsa-complete-notes.pdf",
  },
  {
    title: "Operating Systems - Unit 1 to Unit 5",
    subject: "Computer Science",
    semester: "4th Semester",
    fileKey: "notes/seed/os-unit-1-to-5.pdf",
  },
  {
    title: "Engineering Mathematics II - Formula Sheet",
    subject: "Mathematics",
    semester: "2nd Semester",
    fileKey: "notes/seed/engg-maths-2-formulas.pdf",
  },
  {
    title: "Digital Electronics - Lab Manual",
    subject: "Electronics",
    semester: "3rd Semester",
    fileKey: "notes/seed/digital-electronics-lab.pdf",
  },
  {
    title: "Database Management Systems - Exam Notes",
    subject: "Computer Science",
    semester: "5th Semester",
    fileKey: "notes/seed/dbms-exam-notes.pdf",
  },
];

const CDN_URL = process.env.AWS_CDN_URL ?? "https://example-bucket.s3.amazonaws.com";

// ─── Seed logic ───────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding users...");
  const createdUsers = [];
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    createdUsers.push(user);
    console.log(`  ✓ ${user.email} (${user.role})`);
  }

  const [admin, priya, rahul] = createdUsers;
  const jobAuthors = [admin, priya, rahul];

  console.log("Seeding jobs...");
  for (const [i, job] of JOBS.entries()) {
    const author = jobAuthors[i % jobAuthors.length];
    const baseSlug = slugify(`${job.title}-${job.company}`, { lower: true, strict: true });
    const slug = `${baseSlug}-${i}`;

    await prisma.job.upsert({
      where: { slug },
      update: {},
      create: {
        ...job,
        slug,
        authorId: author.id,
      },
    });
    console.log(`  ✓ ${job.title} @ ${job.company}`);
  }

  console.log("Seeding notes...");
  const noteUploaders = [priya, rahul];
  for (const [i, note] of NOTES.entries()) {
    const uploader = noteUploaders[i % noteUploaders.length];

    await prisma.noteFile.upsert({
      where: { fileKey: note.fileKey },
      update: {},
      create: {
        ...note,
        fileUrl: `${CDN_URL}/${note.fileKey}`,
        downloadCount: Math.floor(Math.random() * 200),
        uploaderId: uploader.id,
      },
    });
    console.log(`  ✓ ${note.title}`);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
