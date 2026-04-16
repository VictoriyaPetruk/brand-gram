import { NextRequest, NextResponse } from "next/server";
import { ContentLabResponse } from "../../analytics/[accountName]/data.mock";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const { instagramJson, analyticsJson } = (await req.json()) as {
    instagramJson?: string;
    analyticsJson?: string;
  };

  if (typeof instagramJson !== "string" || typeof analyticsJson !== "string") {
    return NextResponse.json(
      { error: "Parameters 'instagramJson' and 'analyticsJson' are required." },
      { status: 400 }
    );
  }

  const prompt = `You are an Instagram content strategist.

Instagram profile / media JSON:
${instagramJson}

Audience & brand analytics JSON:
${analyticsJson}

Return ONLY valid JSON (no markdown fences) with exactly this shape:
{
  "ideas": [
    {
      "type": "Educational | Entertainment | Sales | Announcement | Case Study",
      "color": "#RRGGBB hex for a badge",
      "title": "short headline for the post idea",
      "hook": "1-2 sentence teaser"
    }
  ]
}

Rules:
- Provide exactly 5 objects in "ideas", each a distinct angle (mix types where appropriate).
- Titles and hooks must be specific to this brand and audience data.
- Colors must be valid 6-digit hex with #.`;

  const body = {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  let parsed: ContentLabResponse;
  try {
    parsed = JSON.parse(content) as ContentLabResponse;
  } catch (e) {
    console.error("JSON parse error:", e, "\nRaw:\n", content);
    return NextResponse.json({ error: "Failed to parse model response" }, { status: 500 });
  }

  if (
    !parsed?.ideas ||
    !Array.isArray(parsed.ideas) ||
    parsed.ideas.length !== 5 ||
    !parsed.ideas.every(
      (i) =>
        typeof i?.type === "string" &&
        typeof i?.color === "string" &&
        typeof i?.title === "string" &&
        typeof i?.hook === "string"
    )
  ) {
    return NextResponse.json({ error: "Invalid response schema" }, { status: 500 });
  }

  return NextResponse.json(parsed);
}
