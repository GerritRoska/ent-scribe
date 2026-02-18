"use client";

import { useState, useRef, useCallback } from "react";

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
    <path
      d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="22" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
);

interface RecordButtonProps {
  onTranscriptChunk: (text: string) => void;
  onRecordingComplete: (fullTranscript: string) => void;
}

export default function RecordButton({ onTranscriptChunk, onRecordingComplete }: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptPartsRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const sendChunk = useCallback(async (blob: Blob) => {
    if (blob.size < 1000) return;
    const formData = new FormData();
    formData.append("audio", blob);
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) {
        transcriptPartsRef.current.push(data.text);
        onTranscriptChunk(data.text);
      }
    } catch (err) {
      console.error("Chunk transcription error:", err);
    }
  }, [onTranscriptChunk]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      transcriptPartsRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      chunkIntervalRef.current = setInterval(() => {
        if (recorder.state === "recording") {
          recorder.requestData();
          const blob = new Blob(chunksRef.current, { type: mimeType });
          chunksRef.current = [];
          sendChunk(blob);
        }
      }, 30000);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Could not access microphone. Please allow microphone access and try again.");
    }
  }, [sendChunk]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    setIsProcessing(true);

    if (timerRef.current) clearInterval(timerRef.current);
    if (chunkIntervalRef.current) clearInterval(chunkIntervalRef.current);

    const recorder = mediaRecorderRef.current;
    recorder.onstop = async () => {
      const mimeType = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mimeType });
      await sendChunk(blob);

      streamRef.current?.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      setIsProcessing(false);

      const fullTranscript = transcriptPartsRef.current.join(" ");
      onRecordingComplete(fullTranscript);
    };

    recorder.stop();
  }, [sendChunk, onRecordingComplete]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer — always reserve height to prevent layout shift */}
      <div
        className="flex items-center gap-2.5 h-8 transition-opacity duration-300"
        style={{ opacity: isRecording ? 1 : 0 }}
      >
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-lg font-semibold text-slate-700 tabular-nums tracking-wider">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Button wrapper — fixed size to contain rings */}
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        {/* Pulse rings when recording */}
        {isRecording && (
          <>
            <span
              className="absolute rounded-full bg-red-400 animate-ping"
              style={{
                width: 148,
                height: 148,
                opacity: 0.22,
                animationDuration: "2s",
              }}
            />
            <span
              className="absolute rounded-full bg-red-400 animate-ping"
              style={{
                width: 148,
                height: 148,
                opacity: 0.12,
                animationDuration: "2s",
                animationDelay: "0.7s",
              }}
            />
          </>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            relative z-10 w-36 h-36 rounded-full flex items-center justify-center
            transition-all duration-300 ease-out active:scale-95
            ${isProcessing
              ? "bg-slate-200 cursor-not-allowed"
              : isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-indigo-600 hover:bg-indigo-700"
            }
          `}
          style={{
            transform: isRecording ? "scale(1.06)" : undefined,
            boxShadow: isProcessing
              ? "none"
              : isRecording
              ? "0 8px 30px rgba(239,68,68,0.4), 0 0 0 5px rgba(239,68,68,0.12)"
              : "0 8px 30px rgba(79,70,229,0.35), 0 0 0 5px rgba(79,70,229,0.1)",
          }}
        >
          {isProcessing ? (
            <svg className="animate-spin h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : isRecording ? (
            <StopIcon />
          ) : (
            <MicIcon />
          )}
        </button>
      </div>

      {/* Hint */}
      <p
        className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
          isProcessing
            ? "text-slate-400"
            : isRecording
            ? "text-red-500"
            : "text-slate-400"
        }`}
      >
        {isProcessing
          ? "Processing audio..."
          : isRecording
          ? "Tap to stop recording"
          : "Tap to begin recording"}
      </p>
    </div>
  );
}
