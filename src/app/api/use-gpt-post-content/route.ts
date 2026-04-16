import { NextRequest, NextResponse } from "next/server";
import { GeneratedPostContent } from "../../analytics/[accountName]/data.mock";

type RequestBody = {
  contextPromptJson?: string;
  postText?: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const body = (await req.json()) as RequestBody;
  const rawContext = typeof body.contextPromptJson === "string" ? body.contextPromptJson.trim() : "";
  const postText = typeof body.postText === "string" ? body.postText.trim() : "";

  if (!rawContext || !postText) {
    return NextResponse.json(
      { error: "Parameters 'contextPromptJson' and 'postText' are required non-empty strings." },
      { status: 400 }
    );
  }

  let contextPretty: string;
  try {
    const parsed = JSON.parse(rawContext) as unknown;
    contextPretty = JSON.stringify(parsed, null, 2);
  } catch {
    return NextResponse.json(
      { error: "Parameter 'contextPromptJson' must be valid JSON." },
      { status: 400 }
    );
  }

  const prompt = `You are an Instagram content strategist.

User / brand context (JSON):
${contextPretty}

Chosen post (plain text):
${postText}

Write full Instagram content aligned with the context above and expanding the chosen post.

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "caption": "3-5 paragraph caption with emojis, real value, natural CTA at end",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10","#tag11","#tag12","#tag13","#tag14","#tag15"],
  "imagePrompt": "Detailed visual prompt: style, mood, composition, colors, lighting, technical details for a professional Instagram post",
  "strategyNote": "2-3 sentences: Why This Works — why this post resonates with the audience from the context and what engagement behavior it drives"
}`;

  const geminiBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiBody),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json(
      { error: "Gemini request failed", details: errorText },
      { status: res.status }
    );
  }

  const data = await res.json();
  let content = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;

  if (!content) {
    return NextResponse.json({ error: "No content returned from model" }, { status: 500 });
  }

  content = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: GeneratedPostContent;
  try {
    parsed = JSON.parse(content) as GeneratedPostContent;
  } catch (error) {
    console.error("JSON parse error:", error, "\nRaw content:\n", content);
    return NextResponse.json({ error: "Failed to parse model response" }, { status: 500 });
  }

  if (
    typeof parsed.caption !== "string" ||
    !Array.isArray(parsed.hashtags) ||
    parsed.hashtags.length === 0 ||
    typeof parsed.imagePrompt !== "string" ||
    typeof parsed.strategyNote !== "string"
  ) {
    return NextResponse.json({ error: "Invalid model response schema." }, { status: 500 });
  }

  return NextResponse.json(parsed);
}
