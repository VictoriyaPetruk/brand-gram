import { useState } from "react";

export default function PublishPopup({ username, onClose }: { username: string; onClose: () => void }) {
  const message = `I want to link the website for my account (@${username})`;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
      <div className="mx-4 max-w-md w-full rounded-3xl border border-border/50 bg-card p-8 text-center shadow-soft">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">🚀 Ready to Publish</h2>
        <p className="text-muted-foreground mb-4">
          To publish and purchase your website, DM us on Instagram:
          <br />
          <a
            href="https://instagram.com/brandgram_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-medium text-primary underline underline-offset-4"
          >
            @brandgram_ai
          </a>
        </p>
        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 mb-4">
          {message}
        </div>
        <button
          onClick={handleCopy}
          className="mb-4 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90"
        >
          {copied ? "Copied!" : "Copy Text"}
        </button>
        <br />
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}