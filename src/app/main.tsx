// app/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarqueeDemo } from "./reviewcard";

export default function MainPage() {
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Initialize the router

  const handleSearch = async () => {
    if (!accountName) return;

    // Show loading screen
    setLoading(true);
     
    try {
      router.push(`/analytics/${accountName}`);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      alert("Failed to fetch analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto flex w-full max-w-screen-lg flex-col items-center justify-center mt-10 px-4 sm:px-6'>
      {/* Search Block */}
      <div className='p-8 bg-card rounded-3xl shadow-soft border border-border/50 w-full max-w-md mb-6'>
        <h1 className='text-2xl font-semibold mb-4 text-center text-foreground'>
          Put your Instagram username⭐
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
          className='w-full'
          disabled={loading}
        >
          {loading ? "Loading..." : "Analyze"}
        </Button>

        {loading && (
          <div className='mt-4 text-center text-muted-foreground'>
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
