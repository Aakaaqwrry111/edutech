import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import pdf from "pdf-parse";
import type { AlchemyResult } from "@/lib/types";

const SYSTEM_PROMPT = `You transform uploaded curriculum into study assets. Return only valid JSON, no markdown wrappers, no prose. Schema: {"summaries":[{"title":"string","shorten_level":"brief|standard|deep","key_points":["string"]}],"flashcards":[{"front":"string","back":"string","id":"uuid"}],"quizzes":[{"question":"string","options":["string"],"correct_index":0,"explanation":"string"}],"presentations":[{"slide_title":"string","bullet_points":["string"]}]}.`;

function chunkText(text: string, maxChars = 18000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) chunks.push(text.slice(i, i + maxChars));
  return chunks;
}

function normalizeIds(result: AlchemyResult): AlchemyResult {
  return { ...result, flashcards: result.flashcards.map((card) => ({ ...card, id: card.id || randomUUID() })) };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  const form = await request.formData();
  const upload = form.get("file");
  if (!(upload instanceof File)) return NextResponse.json({ error: "Upload a curriculum PDF or text file using the 'file' field" }, { status: 400 });
  const buffer = Buffer.from(await upload.arrayBuffer());
  const text = upload.type === "application/pdf" || upload.name.endsWith(".pdf") ? (await pdf(buffer)).text : buffer.toString("utf8");
  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { responseMimeType: "application/json" },
      contents: [{ role: "user", parts: [{ text: `Create concise MVP-ready assets from these chunks:\n${chunkText(text).join("\n---CHUNK---\n")}` }] }],
    }),
  });
  if (!geminiResponse.ok) return NextResponse.json({ error: await geminiResponse.text() }, { status: 502 });
  const payload = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const parsed = JSON.parse(payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}") as AlchemyResult;
  return NextResponse.json(normalizeIds(parsed));
}
