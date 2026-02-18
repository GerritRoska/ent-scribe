"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTemplates, Template } from "@/lib/templates";
import TranscriptView from "@/components/TranscriptView";

const WAVEFORM_HEIGHTS = [4, 8, 14, 18, 12, 16, 8, 18, 14, 6];

function RecordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? "";
  const patientName = searchParams.get("name") ?? "";
  const patientDob = searchParams.get("dob") ?? "";

  const [template, setTemplate] = useState<Template | null>(null);
  const [transcriptChunks, setTranscriptChunks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriptPartsRef = useRef<string[]>([]);
  const pendingChunksRef = useRef<Promise<void>[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const templates = getTemplates();
    const found = templates.find((t) => t.id === templateId);
    setTemplate(found ?? null);
  }, [templateId]);

  const sendChunk = useCallback(async (blob: Blob) => {
    if (blob.size < 1000) return;
    const formData = new FormData();
    formData.append("audio", blob);
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) {
        transcriptPartsRef.current.push(data.text);
        setTranscriptChunks((prev) => [...prev, data.text]);
      }
    } catch (err) {
      console.error("Chunk transcription error:", err);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      transcriptPartsRef.current = [];
      pendingChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          const blob = new Blob([e.data], { type: mimeType });
          pendingChunksRef.current.push(sendChunk(blob));
        }
      };

      recorder.start(30000); // fire ondataavailable every 30s
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Could not access microphone. Please allow microphone access and try again.");
    }
  }, [sendChunk]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(true);
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    setIsPaused(false);
  }, []);

  const stopRecording = useCallback(
    (currentTemplate: Template) => {
      if (!mediaRecorderRef.current) return;
      setIsProcessing(true);

      if (timerRef.current) clearInterval(timerRef.current);

      const recorder = mediaRecorderRef.current;
      // Must be recording (not paused) for stop to fire ondataavailable
      if (recorder.state === "paused") recorder.resume();

      recorder.onstop = async () => {
        // Wait for all in-flight chunk transcriptions (including the final ondataavailable chunk)
        await Promise.all(pendingChunksRef.current);

        streamRef.current?.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setIsPaused(false);
        setIsProcessing(false);

        const fullTranscript = transcriptPartsRef.current.join(" ");
        if (!fullTranscript.trim()) {
          router.push("/");
          return;
        }

        setIsGenerating(true);
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcript: fullTranscript,
              template: currentTemplate.content,
              patientName: patientName || undefined,
              patientDob: patientDob || undefined,
            }),
          });
          const data = await res.json();
          if (data.note) {
            sessionStorage.setItem("ent-scribe-transcript", fullTranscript);
            sessionStorage.setItem("ent-scribe-note", data.note);
            sessionStorage.setItem("ent-scribe-template-name", currentTemplate.name);
            if (patientName) sessionStorage.setItem("ent-scribe-patient-name", patientName);
            if (patientDob) sessionStorage.setItem("ent-scribe-patient-dob", patientDob);
            router.push("/note");
          }
        } catch (err) {
          console.error("Generate error:", err);
          alert("Failed to generate note. Please try again.");
        } finally {
          setIsGenerating(false);
        }
      };

      recorder.stop();
    },
    [patientName, patientDob, router]
  );

  const cancelRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      if (recorder.state === "paused") recorder.resume();
      recorder.onstop = null;
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.push("/");
  }, [router]);

  // Auto-start when template loads
  useEffect(() => {
    if (template && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startRecording();
    }
  }, [template, startRecording]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 pb-28">
        {/* Status */}
        <div className="text-center mb-10">
          {isRecording && !isPaused && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-500">Recording</span>
              <span className="font-mono text-sm text-gray-400 tabular-nums">
                {formatDuration(duration)}
              </span>
            </div>
          )}
          {isPaused && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-sm font-medium text-gray-500">Paused</span>
              <span className="font-mono text-sm text-gray-400 tabular-nums">
                {formatDuration(duration)}
              </span>
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-500">Processing audio...</span>
            </div>
          )}
          {!isRecording && !isProcessing && (
            <div className="flex items-center justify-center gap-2 mb-3 opacity-0">
              <span className="text-sm text-gray-400">–</span>
            </div>
          )}
          <h2 className="text-lg font-semibold text-gray-900">
            {patientName || "Recording Visit"}
          </h2>
          {template && (
            <p className="text-sm text-gray-400 mt-1">{template.name}</p>
          )}
        </div>

        {/* Live transcript */}
        {transcriptChunks.length > 0 && (
          <div className="w-full max-w-xl bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Live Transcript
              </h3>
            </div>
            <TranscriptView chunks={transcriptChunks} />
          </div>
        )}

        {!isRecording && !isProcessing && transcriptChunks.length === 0 && (
          <p className="text-sm text-gray-400 animate-pulse">
            Requesting microphone access...
          </p>
        )}
      </div>

      {/* Floating recording pill */}
      <div className="fixed bottom-8 left-[280px] right-0 flex justify-center pointer-events-none z-50">
        <div className="pointer-events-auto flex items-center gap-4 bg-gray-900 pl-3.5 pr-4 py-3 rounded-full shadow-2xl">
          {/* Cancel × */}
          <button
            onClick={cancelRecording}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Pause / Resume button */}
          {isRecording && !isProcessing && (
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                isPaused
                  ? "bg-amber-400 text-gray-900 hover:bg-amber-300"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
              aria-label={isPaused ? "Resume recording" : "Pause recording"}
            >
              {isPaused ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="3" width="4" height="18" rx="1" />
                    <rect x="15" y="3" width="4" height="18" rx="1" />
                  </svg>
                  Pause
                </>
              )}
            </button>
          )}

          {/* Waveform bars */}
          <div className="flex items-end gap-[3px]" style={{ height: 20 }}>
            {WAVEFORM_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full"
                style={{
                  height: isRecording && !isPaused ? `${h}px` : "4px",
                  backgroundColor: isPaused
                    ? "rgba(251,191,36,0.6)"
                    : isRecording
                    ? "rgba(255,255,255,0.75)"
                    : "rgba(255,255,255,0.25)",
                  transformOrigin: "bottom center",
                  animation: isRecording && !isPaused
                    ? `waveform 0.7s ease-in-out ${i * 65}ms infinite`
                    : "none",
                  transition: "height 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Record/stop indicator */}
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white/70 rounded-full animate-spin flex-shrink-0" />
          ) : (
            <button
              onClick={() => template && stopRecording(template)}
              disabled={!isRecording}
              className={`w-5 h-5 rounded-full flex-shrink-0 transition-all duration-300 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  : "bg-gray-600"
              }`}
            />
          )}
        </div>
      </div>

      {/* Generating overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="flex flex-col items-center gap-5">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="animate-spin h-7 w-7 text-gray-700" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-semibold text-lg">Generating note...</p>
              <p className="text-gray-500 text-sm mt-1">Using {template?.name} template</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RecordPageContent />
    </Suspense>
  );
}
