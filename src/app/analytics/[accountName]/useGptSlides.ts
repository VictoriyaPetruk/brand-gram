import { WebSiteResponseGpt } from "./data.mock";

const UseGptSlides = async (jsonContent: string): Promise<WebSiteResponseGpt| null> => {
  try {
    const res = await fetch("/api/use-gpt-slides", {
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

export default UseGptSlides;