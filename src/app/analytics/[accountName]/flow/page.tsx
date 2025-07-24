'use client';

import { useRouter } from "next/navigation";
import { useState, use } from "react";
import { LinkItem } from "../data.mock";

type Palette = {
  name: string;
  color: string;
};

const palettes: Palette[] = [
  { name: "Lavande 💜", color: "purple" },
  { name: "Sky 💙", color: "blue" },
  { name: "Red-Rose ❤️", color: "red"},
  { name: "Mint 💚", color: "green"},
  { name: "Sun 💛", color: "yellow"}
];

type PageProps = {
  params: Promise<{ accountName: string, hashtag: string }>;
};

export default function StartFlow({ params }: PageProps) {
  const [step, setStep] = useState<number>(0);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [palette, setPalette] = useState<string>(palettes[0].color);
  const [urlErrors, setUrlErrors] = useState<boolean[]>([]);
  const resolvedParams = use(params);
  const router = useRouter();

  const validateUrl = (url: string): boolean => {
    const regex = /^(https?:\/\/)?([\w\d\-]+\.){1,}[a-z]{2,}(:\d+)?(\/.*)?$/i;
    return regex.test(url);
  };

  const handleLinkChange = (index: number, key: 'url' | 'title', value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index][key] = value;
    setLinks(updatedLinks);

    if (key === 'url') {
      const newErrors = [...urlErrors];
      newErrors[index] = !validateUrl(value);
      setUrlErrors(newErrors);
    }
  };

  const addLink = () => {
    setLinks([...links, { url: '', title: '' }]);
    setUrlErrors([...urlErrors, false]);
  };

  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    const updatedErrors = urlErrors.filter((_, i) => i !== index);
    setLinks(updatedLinks);
    setUrlErrors(updatedErrors);
  };

  const next = () => {
    if (step === 1) {
      const filledLinks = links.filter(
        (link) => link.url.trim() !== '' || link.title.trim() !== ''
      );

      if (filledLinks.length > 0) {
        localStorage.setItem(
          resolvedParams.accountName + "-links",
          JSON.stringify(filledLinks)
        );
      }
    }

    if (step === 2) {
      localStorage.setItem(
        resolvedParams.accountName + "-color",
        palette
      );
      router.push(`/analytics/${resolvedParams.accountName}/website`);
    }

    setStep(step + 1);
  };

  const back = () => setStep((s) => s - 1);

  return (
    <div className="min-h-screen bg-white px-6 py-10 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">

        {step === 0 && (
          <div className="animate-fade text-center">
            <h1 className="text-3xl font-bold mb-4">✨Your website is almost ready</h1>
            <p className="text-gray-600 mb-6">
              Please answer several questions to customize it.
            </p>
            <div className="flex justify-between">
              <button onClick={() => router.push("/")} className="text-gray-500">← Back</button>
              <button
                onClick={next}
                className="bg-purple-600 text-white px-4 py-2 rounded-full"
              >
                Next 🚀
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade">
            <h2 className="text-2xl font-bold mb-4">
              💬 What links do you want to add to your website?
            </h2>

            {links.map((link, i) => (
              <div key={i} className="mb-4 relative">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => handleLinkChange(i, 'title', e.target.value)}
                  placeholder="Title (e.g. My Portfolio)"
                  className="w-full border p-2 rounded mb-2"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleLinkChange(i, 'url', e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full border p-2 rounded ${
                    urlErrors[i] ? 'border-red-500' : ''
                  }`}
                />
                {urlErrors[i] && (
                  <p className="text-red-500 text-sm mt-1">Invalid URL</p>
                )}
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="absolute top-0 right-0 text-red-500 font-bold text-lg px-2"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={addLink}
              className="text-purple-600 text-sm mb-4 underline"
            >
              + add more
            </button>

            <div className="flex justify-between mt-6">
              <button onClick={back} className="text-gray-500">
                ← Back
              </button>
              <button
                onClick={next}
                className="bg-purple-600 text-white px-4 py-2 rounded-full"
              >
                next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade">
            <h2 className="text-2xl font-bold mb-4">🎨 Choose colour palette</h2>
            <div className="space-y-2">
              {palettes.map((p) => (
                <label
                  key={p.color}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="palette"
                    checked={palette === p.color}
                    onChange={() => setPalette(p.color)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={back} className="text-gray-500">
                ← Back
              </button>
              <button
                onClick={next}
                className="bg-purple-600 text-white px-4 py-2 rounded-full"
              >
                Create 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}