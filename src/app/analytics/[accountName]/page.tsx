"use client";
import { use } from "react";
import InstagramProfileCard from "@/components/ui/InstagramProfileCard";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { AnalyticsCard } from "./analytics-card";
import { MessageSquare } from "lucide-react";
import { mockData } from "./data.mock";

type AnalyticsPageProps = {
  params: { accountName: string };
};

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const resolvedParams = use(params);
  // add api call

  return (
    <div className='flex flex-col justify-center items-center min-h-screen bg-gray-100 p-6 gap-4'>
      <AnimatedShinyText className='inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400'>
        <b>✨ Your Analytics</b>
      </AnimatedShinyText>
      <div className='flex flex-col lg:flex-row gap-8 w-full max-w-5xl'>
        {/* Left Section: Tweet Card */}
        <div className='w-full lg:w-1/2 bg-white rounded-lg shadow-md p-4'>
          <InstagramProfileCard
            imageUrl={mockData.imageUrl}
            accountName={resolvedParams.accountName}
            description={mockData.description}
          />
        </div>

        {/* Right Section: Text and Progress */}
        <div className='w-full lg:w-1/2 flex flex-col justify-between  bg-white rounded-lg shadow-md p-4'>
          <div>
            <div className='mb-4'>
              <div className='text-2xl font-semibold text-gray-800 text-center'>
                Your Brand Value
              </div>
            </div>
            {/* Circle Progress Bar */}
            <div className='relative flex items-center justify-center'>
              <svg className='w-36 h-36' viewBox='0 0 36 36'>
                <circle
                  className='text-gray-200 stroke-current'
                  strokeWidth='4'
                  fill='none'
                  cx='18'
                  cy='18'
                  r='16'
                ></circle>
                <circle
                  className='text-blue-500 stroke-current'
                  strokeWidth='4'
                  strokeLinecap='round'
                  fill='none'
                  cx='18'
                  cy='18'
                  r='16'
                  strokeDasharray='100'
                  strokeDashoffset={100 - mockData.score} // Example value, adjust dynamically
                  transform='rotate(-90 18 18)'
                ></circle>
              </svg>
              <span className='absolute text-lg font-semibold text-gray-800'>
                {`${mockData.score}%`}
              </span>
            </div>
          </div>

          <div className='w-full mt-4 justify-bottom'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Latest Post Analysis
            </h3>
            <div className='mt-4 space-y-2'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Format</span>
                <span className='font-medium'>Image</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Likes</span>
                <span className='font-medium'>15</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Comments</span>
                <span className='font-medium'>0</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Hashtags</span>
                <span className='font-medium'>Low engagement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnalyticsCard />
    </div>
  );
}
