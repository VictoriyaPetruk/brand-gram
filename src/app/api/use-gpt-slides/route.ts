// app/api/use-gpt-analytics/route.ts

import { NextRequest, NextResponse } from "next/server";
import { WebSiteResponseGpt } from "../../analytics/[accountName]/data.mock";

export async function POST(req: NextRequest) {
  const { jsonContent } = await req.json();

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
    Information about the Instagram posts: ${jsonContent}
  `;

  const body = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GPT_TOKEN}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "No content returned from GPT" }, { status: 500 });
  }

  let parsed: WebSiteResponseGpt;

    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e, "\nRaw content:\n", content);
      return NextResponse.json({ error: "Failed to parse GPT response" }, { status: 500 });
    }

    return NextResponse.json(parsed);
}
