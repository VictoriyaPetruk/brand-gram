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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold mb-4">🚀 Ready to Publish</h2>
        <p className="text-gray-700 mb-4">
          To publish and purchase your website, DM us on Instagram:
          <br />
          <a
            href="https://instagram.com/brandgram_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 underline mt-2 inline-block"
          >
            @brandgram_ai
          </a>
        </p>
        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 mb-4">
          {message}
        </div>
        <button
          onClick={handleCopy}
          className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition mb-4"
        >
          {copied ? "Copied!" : "Copy Text"}
        </button>
        <br />
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}