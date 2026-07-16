
# EduHub — Collaborative Education & Job Board Platform

EduHub is a unified, full-stack platform designed to bridge the gap between academic learning and early career opportunities. Built with a modern, type-safe stack, it provides students and job seekers with a streamlined interface to share study materials and discover relevant job openings.

---

## 🚀 Key Features

* **🔒 Secure Authentication:** Implements stateful authentication using **NextAuth.js**, featuring protected routing and session verification across dynamic layout routes.


* **💼 Dynamic Job Board:** Users can browse, filter, and view technical job postings with dynamic routing (`/jobs/[slug]`) and custom query filters.


* **📚 Note-Sharing System:** A collaborative portal where users can search, filter, and upload academic notes.


* **📁 Secure File Uploads:** A custom file processing pipeline that validates file constraints, types, and sizes before staging documents.


* **🗄️ Relational Database Management:** Utilizing **Prisma ORM** to model robust relations between users, notes, and job listings, optimized for quick, filtered queries.



---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS


* **Backend:** Next.js API Routes, Route Handlers


* **Database & ORM:** Prisma ORM (configured with PostgreSQL/MongoDB)


* **Authentication:** NextAuth.js


* **Validation:** Zod (via custom schemas)



---

## 📂 Directory Structure

```text
EduHub-main/
├── prisma/
│   ├── schema.prisma       # Database schema and relations
│   └── seed.ts             # Seed script for mock data
├── src/
│   ├── app/
│   │   ├── api/            # API routes (Auth, Jobs, Notes, Uploads)
│   │   ├── (auth)/         # Authentication pages (Login)
│   │   ├── jobs/           # Job board directory & slug routes
│   │   └── notes/          # Note-sharing directory
│   ├── components/
│   │   ├── auth/           # Login and register forms
│   │   ├── jobs/           # Job listings, filters, and cards
│   │   └── notes/          # Notes grid, uploaders, and filters
│   ├── hooks/              # Custom hooks (e.g., useUpload)
│   ├── lib/                # Configs (Prisma client, NextAuth, storage helpers)
│   └── middleware.ts       # Route-level security and redirection

```

---

## ⚙️ Getting Started

### 1. Prerequisites

Ensure you have **Node.js** (v18+) and your preferred package manager (npm or yarn) installed.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/rehanrkhan11/EduHub.git
cd EduHub
npm install

```

### 3. Environment Setup

Create a `.env` file in the root directory and configure your credentials:

```env
# Database connection
DATABASE_URL="your-database-connection-string"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

```

### 4. Database Migrations & Seeding

Generate the Prisma client, run the migrations, and seed the database with initial job/note records:

```bash
npx prisma generate
npx prisma db push
npx prisma db seed

```

### 5. Running the Application

Start the local development server:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.
