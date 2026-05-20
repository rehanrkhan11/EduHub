import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Welcome to <span className="text-indigo-600">EduHub</span>
      </h1>
      <p className="text-xl text-gray-500 mb-8 max-w-xl">
        Find jobs and download class notes — all in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/jobs"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500 transition-colors"
        >
          Browse Jobs
        </Link>
        <Link
          href="/notes"
          className="rounded-lg bg-gray-100 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          Class Notes
        </Link>
      </div>
    </div>
  );
}