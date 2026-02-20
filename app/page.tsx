"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTemplates, Template } from "@/lib/templates";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showNew = searchParams.get("new") === "1";

  const [templates] = useState<Template[]>(() => getTemplates());
  const [selectedId, setSelectedId] = useState<string>(() => getTemplates()[0]?.id ?? "");
  const [patientName, setPatientName] = useState("");
  const [patientDob, setPatientDob] = useState("");

  const handleStart = () => {
    if (!selectedId) return;
    const params = new URLSearchParams({ templateId: selectedId });
    if (patientName.trim()) params.set("name", patientName.trim());
    if (patientDob) params.set("dob", patientDob);
    router.push(`/record?${params.toString()}`);
  };

  if (showNew) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="w-full max-w-sm px-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            New Interview
          </h1>
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Patient Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name (optional)"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={patientDob}
                onChange={(e) => setPatientDob(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Note Type
              </label>
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}{!t.isDefault ? " ★" : ""}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-5 pt-1">
              <button
                onClick={() => router.push("/")}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                disabled={!selectedId}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
                  <path
                    d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Start Recording
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="flex flex-col items-center gap-5 text-center px-8">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
            <path
              d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="22" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Start a new interview</h2>
          <p className="text-gray-500 text-sm mt-1.5 max-w-xs leading-relaxed">
            Record, transcribe, and generate clinical notes automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
