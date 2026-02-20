"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import { saveVisit } from "@/lib/visits";

interface SessionVisitDraft {
  note: string;
  transcript: string;
  patientName?: string;
  patientDob?: string;
  templateName: string;
}

function readSessionVisitDraft(): SessionVisitDraft {
  if (typeof window === "undefined") {
    return { note: "", transcript: "", templateName: "ENT Visit" };
  }

  return {
    note: sessionStorage.getItem("ent-scribe-note") ?? "",
    transcript: sessionStorage.getItem("ent-scribe-transcript") ?? "",
    patientName: sessionStorage.getItem("ent-scribe-patient-name") ?? undefined,
    patientDob: sessionStorage.getItem("ent-scribe-patient-dob") ?? undefined,
    templateName: sessionStorage.getItem("ent-scribe-template-name") ?? "ENT Visit",
  };
}

export default function NotePage() {
  const router = useRouter();
  const sessionDraft = useMemo(() => readSessionVisitDraft(), []);
  const [note, setNote] = useState(sessionDraft.note);
  const [transcript] = useState(sessionDraft.transcript);
  const savedRef = useRef(false);

  useEffect(() => {
    if (sessionDraft.note && !savedRef.current) {
      savedRef.current = true;
      saveVisit({
        templateName: sessionDraft.templateName,
        patientName: sessionDraft.patientName || undefined,
        patientDob: sessionDraft.patientDob || undefined,
        note: sessionDraft.note,
        transcript: sessionDraft.transcript,
      });
    }
  }, [sessionDraft]);

  const handleNewVisit = () => {
    ["ent-scribe-note", "ent-scribe-transcript", "ent-scribe-patient-name",
      "ent-scribe-patient-dob", "ent-scribe-template-name"].forEach((k) =>
      sessionStorage.removeItem(k)
    );
    router.push("/");
  };

  const handleDownload = () => {
    const patientName = sessionStorage.getItem("ent-scribe-patient-name") ?? "visit";
    const date = new Date().toISOString().slice(0, 10);
    const filename = `note-${patientName.replace(/\s+/g, "-")}-${date}.txt`;
    const blob = new Blob([note], { type: "text/plain" });
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
        <h1 className="text-xl font-bold text-gray-900">Visit Note</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!note}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            .txt
          </button>
          <CopyButton text={note} label="Copy Note" />
        </div>
      </div>

      {/* Note textarea */}
      <div className="flex flex-col gap-2 flex-1">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={22}
          className="w-full font-mono text-sm text-gray-800 bg-white border border-gray-200 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y leading-relaxed shadow-sm"
          placeholder="Your formatted ENT note will appear here after recording..."
        />
        <p className="text-xs text-gray-400">
          Edit above before copying. AI output requires physician review.
        </p>
      </div>

      {/* Transcript collapsible */}
      {transcript && (
        <details className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              View Full Transcript
            </span>
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
              className="text-gray-400 transition-transform duration-200 group-open:rotate-180"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="px-5 pb-5 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap pt-4">
              {transcript}
            </p>
          </div>
        </details>
      )}

      {/* Warning */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <span className="text-amber-500 text-base flex-shrink-0">⚕</span>
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">Physician review required.</span>{" "}
          This note was generated by AI from audio. Verify all clinical details before signing or
          entering into eClinicalWorks.
        </p>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={() => router.push("/history")}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          View history
        </button>
        <button
          onClick={handleNewVisit}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold text-sm py-2 px-4 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
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
          New Visit
        </button>
      </div>
    </div>
  );
}
