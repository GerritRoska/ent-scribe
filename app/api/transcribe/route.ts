import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type TranscriptionProvider = "deepgram" | "openai";

type ErrorDetails = {
  status?: number;
  message: string;
};

function getErrorDetails(err: unknown): ErrorDetails {
  if (!err || typeof err !== "object") {
    return { status: undefined, message: String(err ?? "Unknown transcription error") };
  }

  const maybeError = err as {
    status?: number;
    message?: string;
    error?: { message?: string };
    details?: string;
  };

  return {
    status: maybeError.status,
    message:
      maybeError.error?.message ||
      maybeError.message ||
      maybeError.details ||
      "Unknown transcription error",
  };
}

function getTranscriptionProvider(): TranscriptionProvider {
  const provider = process.env.TRANSCRIPTION_PROVIDER?.toLowerCase();
  return provider === "openai" ? "openai" : "deepgram";
}

function getDeepgramErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Deepgram transcription failed";
  }

  const maybeError = payload as {
    err_msg?: string;
    error?: string;
    message?: string;
  };

  return maybeError.err_msg || maybeError.error || maybeError.message || "Deepgram transcription failed";
}

function extractDeepgramTranscript(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const data = payload as {
    results?: {
      channels?: Array<{ alternatives?: Array<{ transcript?: string }> }>;
      utterances?: Array<{ transcript?: string }>;
    };
  };

  const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript;
  if (typeof transcript === "string" && transcript.trim()) {
    return transcript;
  }

  const utterances = data.results?.utterances
    ?.map((u) => u.transcript?.trim())
    .filter((u): u is string => Boolean(u));

  return utterances?.join(" ") ?? "";
}

function getDeepgramKeyterms(formData: FormData): string[] {
  const fromForm = formData
    .getAll("keyterm")
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  const fromEnv = (process.env.DEEPGRAM_KEYTERMS || "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

  const unique = new Set<string>();
  [...fromEnv, ...fromForm].forEach((term) => {
    if (unique.size < 100) unique.add(term);
  });

  return [...unique];
}

async function transcribeWithOpenAI(audioBlob: Blob): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const audioFile = new File([audioBlob], "audio.webm", { type: audioBlob.type || "audio/webm" });

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1",
    language: "en",
  });

  return response.text ?? "";
}

async function transcribeWithDeepgram(audioBlob: Blob, formData: FormData): Promise<string> {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY is not set");
  }

  const params = new URLSearchParams({
    model: process.env.DEEPGRAM_MODEL || "nova-3-medical",
    language: "en-US",
    smart_format: "true",
    punctuate: "true",
    numerals: "true",
    diarize: "true",
    paragraphs: "true",
    utterances: "true",
  });

  getDeepgramKeyterms(formData).forEach((term) => params.append("keyterm", term));

  const response = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      "Content-Type": audioBlob.type || "audio/webm",
    },
    body: Buffer.from(await audioBlob.arrayBuffer()),
  });

  const payload = await response.json().catch(() => undefined);

  if (!response.ok) {
    const err = new Error(getDeepgramErrorMessage(payload));
    (err as Error & { status?: number }).status = response.status;
    throw err;
  }

  return extractDeepgramTranscript(payload);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob | null;

    if (!audioBlob) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    if (audioBlob.size === 0) {
      return NextResponse.json({ text: "" });
    }

    const provider = getTranscriptionProvider();
    const text =
      provider === "openai"
        ? await transcribeWithOpenAI(audioBlob)
        : await transcribeWithDeepgram(audioBlob, formData);

    return NextResponse.json({ text });
  } catch (err) {
    const { status, message } = getErrorDetails(err);
    const isIgnorableTailChunkError =
      (status === 400 || status === 415 || status === 422) &&
      /(short|empty|decode|decod|unsupported|invalid|duration)/i.test(message);

    if (isIgnorableTailChunkError) {
      console.warn("Skipping non-transcribable audio chunk:", message);
      return NextResponse.json({ text: "" });
    }

    console.error("Transcription error:", err);
    return NextResponse.json({ error: "Transcription failed", details: message }, { status: 500 });
  }
}
