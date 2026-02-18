import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIErrorDetails(err: unknown) {
  if (!err || typeof err !== "object") {
    return { status: undefined, message: String(err) };
  }

  const maybeError = err as {
    status?: number;
    message?: string;
    error?: { message?: string };
  };

  return {
    status: maybeError.status,
    message: maybeError.error?.message || maybeError.message || "Unknown transcription error",
  };
}

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob | null;

    if (!audioBlob) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    if (audioBlob.size === 0) {
      return NextResponse.json({ text: "" });
    }

    const audioFile = new File([audioBlob], "audio.webm", { type: audioBlob.type || "audio/webm" });

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ text: response.text });
  } catch (err) {
    const { status, message } = getOpenAIErrorDetails(err);
    const isIgnorableTailChunkError =
      (status === 400 || status === 422) &&
      /(short|empty|decode|decod|unsupported|invalid|duration)/i.test(message);

    if (isIgnorableTailChunkError) {
      console.warn("Skipping non-transcribable audio chunk:", message);
      return NextResponse.json({ text: "" });
    }

    console.error("Transcription error:", err);
    return NextResponse.json({ error: "Transcription failed", details: message }, { status: 500 });
  }
}
