// app/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarqueeDemo } from "./reviewcard";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function MainPage() {
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Initialize the router

  const handleSearch = async () => {
    if (!accountName) return;

    // Show loading screen
    setLoading(true);
     
    try {
      // Call AWS Lambda API
     
     // router.push(`/analytics/${accountName}`);
      // const queryString = `?data=${encodeURIComponent(JSON.stringify(data))}`;
      // router.push(`/analytics/${accountName}?query=${queryString}`);
      router.push(`/analytics/${accountName}`);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      alert("Failed to fetch analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center w-full max-w-screen-lg mt-10'>
      {/* Search Block */}
      <div className='p-6 bg-white rounded-lg shadow-md w-full max-w-md mb-6'>
        <h1 className='text-2xl font-semibold mb-4 text-center'>
          How AI rates your Instagram?⭐
        </h1>

        <div className='mb-4'>
          <Input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder='Put your username'
            className='w-full'
          />
        </div>

        <Button
          onClick={handleSearch}
          className='w-full bg-black text-white py-2 rounded-md hover:bg-purple-600'
          disabled={loading}
        >
          {loading ? "Loading..." : "Analyze"}
        </Button>

        {loading && (
          <div className='mt-4 text-center text-gray-500'>
            Searching for {accountName}...
          </div>
        )}
      </div>

      {/* MarqueeDemo Block */}
      <div className='w-full'>
        <MarqueeDemo />
      </div>
    </div>
  );
}
