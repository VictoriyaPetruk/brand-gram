import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { hashtag, page = 1 } = await req.json();

  const PEXELS_TOKEN = process.env.PEXELS_TOKEN;

  if (!PEXELS_TOKEN) {
    return NextResponse.json({ error: "Missing token" }, { status: 500 });
  }

  const res = await fetch(`https://api.pexels.com/v1/search?query=${hashtag}&per_page=10&page=${page}`, {
    headers: {
      Authorization: PEXELS_TOKEN,
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
