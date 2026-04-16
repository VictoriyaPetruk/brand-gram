import { NextResponse } from "next/server";
import { MOCK_WEBSITE_SLIDES_RESPONSE } from "../../../analytics/[accountName]/data.mock";

/**
 * Mock slides — no LLM. Separate from legacy `/api/use-gpt-slides`.
 */
export async function POST() {
  return NextResponse.json(MOCK_WEBSITE_SLIDES_RESPONSE);
}
