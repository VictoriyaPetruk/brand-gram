
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-6 py-10">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">✨ Let’s start creating your website</h1>
        <p className="text-gray-600 mb-6">
          Enter your Instagram username to check if it’s ready
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="@yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
            className="w-full border border-gray-300 rounded-full px-4 py-2 text-center"
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
            className="mt-6 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-fuchsia-600 hover:to-purple-600 transition cursor-pointer disabled:cursor-not-allowed"
            >
        Start 🚀
        </button>

      </div>
    </div>
  );
}