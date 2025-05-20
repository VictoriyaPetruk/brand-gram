'use client';

import Header from '@/components/header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';

type PageProps = {
    params: Promise<{ accountName: string, hashtag: string}>;
};

export default function DashboardPage({ params }: PageProps) {
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const resolvedParams = use(params);
  useEffect(() => {
    const token = process.env.Pexeles_Token;
    const getPexelsImage =  async (page = 1, number = 0) => {
        const url = `https://api.pexels.com/v1/search?query=${resolvedParams.hashtag}&per_page=10&page=${page}`;
      
        try {
          const response = await fetch(url, {
            headers: {
              Authorization: token || "",
            },
          });
      
          if (response.ok) {
            const data = await response.json();
            // setGeneratedImages(data?.data?.map((image: any) => image.url))
            setGeneratedImages(data?.photos.map((image: any) => image.src.original));
            console.log(data);
            return data.photos[number]?.src?.medium || null;
          } else {
            console.error(`Pexels API error: ${response.status}`);
            return null;
          }
        } catch (error) {
          console.error('Error fetching from Pexels:', error);
          return null;
        }
      }

    if (resolvedParams.accountName) {
        getPexelsImage();
    }
  }, [resolvedParams.accountName]);

  if (!generatedImages) return <LoadingSpinner />;

  return (
    <>
     <Header />
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">📸 Content Ideas Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {generatedImages.map((imgUrl, index) => (
          <div key={index} className="flex flex-col items-center bg-white rounded-xl shadow p-4">
            <Image
              src={imgUrl}
              alt={`Generated Image ${index + 1}`}
              width={256}
              height={256}
              className="rounded-lg mb-2"
            />
            <p className="text-center text-sm text-gray-600">Post Idea #{index + 1}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
