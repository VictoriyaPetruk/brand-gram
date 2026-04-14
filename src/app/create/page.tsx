
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsernameInputPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!username) return;

    setLoading(true);
    setError('');

    try {
        const response = await fetch(
            `https://nmaucysl2df74e7574m33y3ykm0hfdoh.lambda-url.eu-central-1.on.aws/api/igbrand/ig?username=${username}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();

      if (!data || !data.business_discovery) {
        setError("This account is either not found or not a business profile.");
        return;
      }

      // Save IG data to localStorage
      localStorage.setItem(
        `${username}-igdata`,
        JSON.stringify(data.business_discovery)
      );

      // Redirect to flow
      router.push(`/analytics/${username}/flow`);
    } catch (e) {
      setError(`Failed to load account data. Please try again.${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-6 py-10">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-foreground tracking-tight">✨ Let’s start creating your website</h1>
        <p className="text-muted-foreground mb-6">
          Enter your Instagram username to check if it’s ready
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="@yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
            className="w-full border border-input bg-card rounded-full px-4 py-3 text-center text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <button
            onClick={handleSubmit}
            disabled={loading || !username}
            className="mt-6 bg-brand-gradient text-white px-8 py-3 rounded-full shadow-soft font-semibold transition-opacity hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
        Start 🚀
        </button>

      </div>
    </div>
  );
}