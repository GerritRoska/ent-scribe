import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SCRIBE_SYSTEM_PROMPT, buildNotePrompt } from "@/lib/prompts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { transcript, template, patientName, patientDob } = await req.json();

    if (!transcript || !template) {
      return NextResponse.json({ error: "transcript and template are required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SCRIBE_SYSTEM_PROMPT },
        { role: "user", content: buildNotePrompt(transcript, template, { name: patientName, dob: patientDob }) },
      ],
      temperature: 0.2,
    });

    const note = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ note });
  } catch (err) {
    console.error("Note generation error:", err);
    return NextResponse.json({ error: "Note generation failed" }, { status: 500 });
  }
}
