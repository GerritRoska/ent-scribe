"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getVisits, deleteVisit, clearVisits, Visit } from "@/lib/visits";
import CopyButton from "@/components/CopyButton";

export default function HistoryPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>(() => getVisits());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const reload = () => setVisits(getVisits());

  const filtered = visits.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      v.patientName?.toLowerCase().includes(q) ||
      v.templateName.toLowerCase().includes(q) ||
      v.note.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  };

  const handleDelete = (id: string) => {
    deleteVisit(id);
    reload();
  };

  const handleClearAll = () => {
    if (confirm("Delete all visit history? This cannot be undone.")) {
      clearVisits();
      reload();
    }
  };

  const downloadNote = (v: Visit) => {
    const label = v.patientName ?? "visit";
    const filename = `note-${label.replace(/\s+/g, "-")}-${v.date.slice(0, 10)}.txt`;
    const blob = new Blob([v.note], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-8 flex flex-col gap-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Visit History</h1>
        {visits.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
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
          placeholder="Search by patient name, template, or note content..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-900 placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
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
          </svg>
          <div className="text-center">
            <p className="font-medium text-gray-500">
              {visits.length === 0 ? "No visits yet" : "No matches found"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {visits.length === 0
                ? "Completed visits will appear here automatically."
                : "Try a different search."}
            </p>
          </div>
          {visits.length === 0 && (
            <button
              onClick={() => router.push("/?new=1")}
              className="mt-2 flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold text-sm py-2 px-4 rounded-full transition-colors"
            >
              Start first visit
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((v) => (
            <div key={v.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {v.patientName ?? "Unknown Patient"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {v.templateName} · {formatDate(v.date)}
                  </p>
                </div>
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
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    expandedId === v.id ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {expandedId === v.id && (
                <div className="px-5 pb-5 border-t border-gray-100 flex flex-col gap-4 pt-4">
                  <div className="flex gap-2 flex-wrap">
                    <CopyButton text={v.note} label="Copy Note" />
                    <button
                      onClick={() => downloadNote(v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Download .txt
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this visit?")) handleDelete(v.id);
                      }}
                      className="px-3 py-1.5 text-sm text-red-400 hover:text-red-600 font-medium ml-auto transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap overflow-auto max-h-72 leading-relaxed">
                    {v.note}
                  </pre>
                  {v.transcript && (
                    <details className="group">
                      <summary className="text-xs text-gray-400 cursor-pointer font-semibold uppercase tracking-wide select-none list-none flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-200 group-open:rotate-90"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        Transcript
                      </summary>
                      <p className="mt-2 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap pl-4">
                        {v.transcript}
                      </p>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
