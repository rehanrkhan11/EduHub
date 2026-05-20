"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { JOB_TYPES } from "@/lib/validations";

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset to page 1 on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <input
        type="search"
        placeholder="Search jobs…"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => updateParam("q", e.target.value)}
        className="h-9 min-w-[200px] flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />

      {/* Type filter */}
      <select
        value={searchParams.get("type") ?? ""}
        onChange={(e) => updateParam("type", e.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-600 focus:border-indigo-400 focus:outline-none"
      >
        <option value="">All types</option>
        {JOB_TYPES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1).replace("-", "-")}
          </option>
        ))}
      </select>

      {/* Location */}
      <input
        type="text"
        placeholder="Location…"
        defaultValue={searchParams.get("location") ?? ""}
        onChange={(e) => updateParam("location", e.target.value)}
        className="h-9 w-36 rounded-lg border border-gray-200 bg-white px-3 text-sm placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
      />

      {/* Clear */}
      {(searchParams.get("q") || searchParams.get("type") || searchParams.get("location")) && (
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
