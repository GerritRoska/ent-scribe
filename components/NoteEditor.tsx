"use client";

import CopyButton from "./CopyButton";

interface NoteEditorProps {
  note: string;
  onChange: (note: string) => void;
}

export default function NoteEditor({ note, onChange }: NoteEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Generated Note
        </h2>
        <CopyButton text={note} />
      </div>
      <textarea
        value={note}
        onChange={(e) => onChange(e.target.value)}
        rows={20}
        className="w-full font-mono text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 resize-y leading-relaxed"
        placeholder="Your formatted ENT note will appear here after recording..."
      />
      <p className="text-xs text-slate-400">
        Edit above before copying. AI output requires physician review.
      </p>
    </div>
  );
}
