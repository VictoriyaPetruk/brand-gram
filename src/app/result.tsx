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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Account Overview</h1>
        
        {mockDescription ? (
          <div className="text-center text-lg text-gray-700">
            <p>{mockDescription}</p>
          </div>
        ) : (
          <div className="text-center text-lg text-gray-700">Loading account data...</div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/")}
            className="py-2 px-4 bg-black text-white rounded-md hover:bg-blue-600"
          >
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
}
