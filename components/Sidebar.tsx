"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getVisits, Visit } from "@/lib/visits";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setVisits(getVisits());
  }, [pathname]);

  const filtered = visits.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      v.patientName?.toLowerCase().includes(q) ||
      v.templateName.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden">
      {/* New Encounter */}
      <div className="p-4">
        <button
          onClick={() => router.push("/?new=1")}
          className="w-full flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold text-sm py-2.5 px-4 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Encounter
        </button>
      </div>

      {/* Encounters section */}
      <div className="px-4 pb-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Encounters
        </p>
        <div className="relative mb-3">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Visit list */}
      <div className="flex-1 overflow-y-auto px-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="text-sm font-medium text-gray-400">
              {visits.length === 0 ? "No encounters yet" : "No matches"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((v) => (
              <button
                key={v.id}
                onClick={() => router.push("/history")}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {v.patientName ?? "Unknown Patient"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {v.templateName} · {formatDate(v.date)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => router.push("/templates")}
          className="flex items-center gap-3 w-full hover:bg-gray-50 px-2 py-2 rounded-lg transition-colors"
        >
          <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
            N
          </div>
          <span className="text-sm font-medium text-gray-700">Settings</span>
        </button>
      </div>
    </aside>
  );
}
