
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

      localStorage.setItem(
        `${username}-igdata`,
        JSON.stringify(data.business_discovery)
      );

      router.push(`/analytics/${username}/flow`);
    } catch (e) {
      setError(`Failed to load account data. Please try again.${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          ✨ Let’s start creating your website
        </h1>
        <p className="mb-6 text-sm sm:text-base text-muted-foreground">
          Enter your Instagram username to check if it’s ready
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="@yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
            className="w-full rounded-full border border-input bg-card px-4 py-3 text-center text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-5 w-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !username}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand-gradient px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-soft transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start 🚀
        </button>
      </div>
    </div>
  );
}