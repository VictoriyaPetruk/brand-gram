"use client";
import { useState } from "react";

export default function Game(): JSX.Element{
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagramVisible, setDiagramVisible] = useState(false);

  const handleSubmit = () => {
    if (!input) return;
    setLoading(true);
    setDiagramVisible(false);
    setTimeout(() => {
      setLoading(false);
      setDiagramVisible(true);
    }, 2000); // simulate generation
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left panel */}
      <div className="flex-1 flex flex-col justify-center items-center bg-orange-100">
        <h1 className="text-3xl font-bold text-orange-800 mb-4">
          Cloud Architecture Demo
        </h1>
        {loading && <p className="text-orange-700 text-xl">Generating...</p>}
        {diagramVisible && (
          <img
            src="/cloud-diagram.png" // replace with your hardcoded diagram
            alt="Cloud Architecture"
            className="w-2/3 mt-4 rounded-lg shadow-lg"
          />
        )}
        {diagramVisible && (
          <a
            href="https://eu-central-1.console.aws.amazon.com/lambda/home?region=eu-central-1#/functions/CloudBlocks?newFunction=true&tab=code" // link to real AWS
            target="_blank"
            className="mt-4 px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            Publish
          </a>
        )}
      </div>

      {/* Right panel */}
      <div className="w-1/3 bg-white border-l border-orange-300 flex flex-col p-4">
        <h2 className="text-xl font-bold text-orange-800 mb-2">Describe your Architecture:</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border border-orange-300 rounded-lg p-2 flex-1 mb-4"
          placeholder="E.g., EC2 + S3 storage"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
        >
          Generate
        </button>
      </div>
    </div>
  );
}