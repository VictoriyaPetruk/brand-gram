'use client';
import Header from "@/components/header";
import { use, useEffect, useState } from "react";

type AnalyticsPageProps = {
    params: Promise<{ accountName: string, hashtag: string}>;
  };
  export default function PostsIdeasPage({ params }: AnalyticsPageProps) {
  const resolvedParams = use(params);

  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resolvedParams.accountName) return;

    const posts = localStorage.getItem("posts");
    if (posts != null){
        const json = JSON.parse(posts);
        setIdeas(json);
        setLoading(false);
    }
  }, [resolvedParams.accountName]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Post Ideas for @{resolvedParams.accountName}
          </h1>

          {loading ? (
            <p className="text-gray-600">Generating ideas...</p>
          ) : (
            <ul className="space-y-4">
              {ideas.map((idea, i) => (
                <li
                  key={i}
                  className="bg-white shadow p-4 rounded-lg border border-gray-200"
                >
                  {idea}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
};
