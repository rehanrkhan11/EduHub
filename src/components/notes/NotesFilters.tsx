"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function NotesFilters({ subjects }: { subjects: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      value ? params.set(key, value) : params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Search notes…"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => updateParam("q", e.target.value)}
        className="h-9 min-w-[200px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />

      <select
        value={searchParams.get("subject") ?? ""}
        onChange={(e) => updateParam("subject", e.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-600 focus:border-indigo-400 focus:outline-none"
      >
        <option value="">All subjects</option>
        {subjects.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {(searchParams.get("q") || searchParams.get("subject")) && (
        <button
          onClick={() => router.push(pathname)}
          className="h-9 rounded-lg px-3 text-sm font-medium text-gray-400 hover:text-gray-700"
        >
          Clear
        </button>
      )}
    </div>
  );
}
