// app/result.tsx

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const router = useRouter();
  const account  = ""; // Get the account name from the query

  const [mockDescription, setMockDescription] = useState("");

  useEffect(() => {
    if (account) {
      // Simulate fetching a mock description based on the account name
      setMockDescription(`This is a mock description for Instagram account @${account}`);
    }
  }, [account]);

  return (
    <div className="flex justify-center items-center h-screen bg-background px-4">
      <div className="p-8 bg-card rounded-3xl shadow-soft border border-border/50 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center text-foreground">Account Overview</h1>
        
        {mockDescription ? (
          <div className="text-center text-lg text-muted-foreground">
            <p>{mockDescription}</p>
          </div>
        ) : (
          <div className="text-center text-lg text-muted-foreground">Loading account data...</div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90"
          >
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
}
