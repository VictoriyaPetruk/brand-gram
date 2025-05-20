import { GptAnalytics } from "./data.mock";

const UseGptAnalytics = async (jsonContent: string): Promise<GptAnalytics | null> => {
  try {
    const res = await fetch("/api/use-gpt-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonContent }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
};

export default UseGptAnalytics;