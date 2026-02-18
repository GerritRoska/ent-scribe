"use client";

import { useEffect, useRef } from "react";

interface TranscriptViewProps {
  chunks: string[];
}

export default function TranscriptView({ chunks }: TranscriptViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chunks]);

  if (chunks.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-400 text-sm italic">
        Transcript will appear here as you record...
      </div>
    );
  }

  return (
    <div className="max-h-48 overflow-y-auto text-sm text-slate-600 leading-relaxed">
      <p className="whitespace-pre-wrap">{chunks.join(" ")}</p>
      <div ref={bottomRef} />
    </div>
  );
}
