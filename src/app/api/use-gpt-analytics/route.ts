// app/api/use-gpt-analytics/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GptAnalytics } from "../../analytics/[accountName]/data.mock";

export async function POST(req: NextRequest) {
  const apiKey = "AIzaSyBqjMYPzQNh3Bw2o5KS48c9KIxnUWBrvak";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OpenAI API key. Set OPENAI_API_KEY (or GPT_TOKEN) in .env.local" },
      { status: 500 }
    );
  }

  const { jsonContent } = await req.json();
  if (typeof jsonContent !== "string" || !jsonContent.trim()) {
    return NextResponse.json({ error: "Parameter 'jsonContent' is required." }, { status: 400 });
  }

  const prompt = `
    Provide Instagram page statistics in json string format according to the template: 
    Brand Value(number from 1-100);
    Description(add some positive facts about the account owner);
    Fun Fact(write fun fact);
    Main Audience;
    Average Engagement Rate(if there is insufficient information, calculate an approximate value based on available data or similar pages, return percentage as float number);
    Average Post Likes(float value);
    Average Post Comments(If there is insufficient information, calculate an approximate value based on the available data, return in float value);
    ContentStyle(the best content style based on available data);
    Formats;
    Hashtag(Define a 1 simple word(not combined) to define the interest of the account);
    Conclusion(a short text to summarise the information on the page status);
    Posts Ideas(return as a string array);
    Marketing Strategy(write marketing strategy to develop account, return as a string array).
    Name each property without empty space. Information about the Instagram page: ${jsonContent}
  `;

  const body = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json(
      { error: "OpenAI request failed", details: errorText },
      { status: res.status }
    );
  }

  const data = await res.json();
  let content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    return NextResponse.json({ error: "No content returned from GPT" }, { status: 500 });
  }
  content = content.replace(/^```json/i, '').replace(/```$/i, '').trim();
  console.log(content);
  let parsed: GptAnalytics;

    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e, "\nRaw content:\n", content);
      return NextResponse.json({ error: "Failed to parse GPT response" }, { status: 500 });
    }

    return NextResponse.json(parsed);
}
