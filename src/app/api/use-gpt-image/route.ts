import { NextRequest, NextResponse } from "next/server";

type RequestBody = {
  imagePrompt?: string;
};

type GeminiPart = {
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
};

function encodePromptForPath(prompt: string): string {
  // encodeURIComponent leaves !'()* unescaped; force RFC3986-safe path encoding.
  return encodeURIComponent(prompt).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function extractImageDataUrl(data: unknown): string | null {
  const candidateParts =
    (data as { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> })?.candidates?.[0]?.content?.parts ?? [];

  for (const part of candidateParts) {
    const base64 = part?.inlineData?.data;
    if (!base64) continue;
    const mimeType = part.inlineData?.mimeType || "image/png";
    return `data:${mimeType};base64,${base64}`;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const body = (await req.json()) as RequestBody;
  const imagePrompt = typeof body.imagePrompt === "string" ? body.imagePrompt.trim() : "";
  if (!imagePrompt) {
    return NextResponse.json({ error: "Parameter 'imagePrompt' is required." }, { status: 400 });
  }

  const promptWithSize = `${imagePrompt}\n\nGenerate a vertical image in 4:5 aspect ratio with exact output size 1080x1350 pixels.`;

  const geminiBody = {
    contents: [{ parts: [{ text: promptWithSize }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  const candidateModels = [
    "gemini-3.0-flash-image-preview",
    "gemini-3.1-flash-image-preview",
  ];

  const failures: Array<{ model: string; status: number; details: string }> = [];

  for (const model of candidateModels) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    if (!res.ok) {
      failures.push({
        model,
        status: res.status,
        details: await res.text(),
      });
      continue;
    }

    const data = (await res.json()) as unknown;
    const imageDataUrl = extractImageDataUrl(data);

    if (!imageDataUrl) {
      failures.push({
        model,
        status: 502,
        details: "Model returned no inline image data.",
      });
      continue;
    }

    return NextResponse.json({ imageDataUrl });
  }

  // Fallback image provider so UI can still render a generated visual when Gemini image models
  // are not available for the current API key/project.
  const seed = Date.now();
  const encodedPrompt = encodePromptForPath(imagePrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1350&seed=${seed}&nologo=true`;

  return NextResponse.json(
    {
      imageUrl,
      provider: "pollinations-fallback",
      warning: "Gemini image models are unavailable for this API key. Used fallback provider.",
      details: failures,
    },
    { status: 200 }
  );
}
