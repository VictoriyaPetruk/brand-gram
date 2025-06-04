// app/api/use-gpt-analytics/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GptAnalytics } from "../../analytics/[accountName]/data.mock";

export async function POST(req: NextRequest) {
  const { jsonContent } = await req.json();

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

  let parsed: GptAnalytics;

    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e, "\nRaw content:\n", content);
      return NextResponse.json({ error: "Failed to parse GPT response" }, { status: 500 });
    }

    return NextResponse.json(parsed);
}
