import { NextRequest, NextResponse } from "next/server";
import { WebSiteResponseGpt } from "../../analytics/[accountName]/data.mock";

export async function POST(req: NextRequest) {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const { jsonContent } = await req.json();
  if (typeof jsonContent !== "string" || !jsonContent.trim()) {
    return NextResponse.json({ error: "Parameter 'jsonContent' is required." }, { status: 400 });
  }

  const prompt = `
    I am sending you a list of social media posts. Each post includes an ID, like count, and caption. Please:
    1. Remove posts with captions that are empty, only 1-3 characters long, or just short words.
    2. Sort the remaining posts by like count in descending order.
    3. From the sorted posts, select up to 4 that best reveal the person's interests, values, and personality traits.
    4. For each selected post, generate a storytelling-style slide written in the first person. 
    5. Do not repeat the caption — instead, generalize it into a broader reflection or insight, describe passion or conclusion that account or business generally do.
    6. Create array SlideFlow[] of 4 slides in the following format:
    {mediaId(post Id as string);
    slideNumber(start from 1);
    title(catchy title that summarizes the theme of the slide as string);
    text(generated story of this slide as string);}
    7. Then generate:
    - "funFact": a short and playful insight that person colud shar about themself, based on post content.
    - "about": description of the person's job, hobbies, etc. — suitable for a "About Me" section in the first person. 
    8. Return the final result as a single JSON object with the following structure:
    {slidesFlow(SlideFlow[] generated in 6 step);
    funFact(as string);
    about(as string);}
    The tone should be confident, inspiring, and reflective — like personal brand storytelling on LinkedIn.
    Use "we" in all sentences instead of "I" if the profile is a business account.
    Return ONLY valid JSON (no markdown fences).
    Information about the Instagram posts: ${jsonContent}
  `;

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

  let parsed: WebSiteResponseGpt;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("JSON parse error:", e, "\nRaw content:\n", content);
    return NextResponse.json({ error: "Failed to parse model response" }, { status: 500 });
  }

  return NextResponse.json(parsed);
}
