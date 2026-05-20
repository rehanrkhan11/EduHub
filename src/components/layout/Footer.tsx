import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} EduHub. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/jobs" className="hover:text-gray-600">Jobs</Link>
            <Link href="/notes" className="hover:text-gray-600">Notes</Link>
            <Link href="/login" className="hover:text-gray-600">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
