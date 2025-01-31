"use client";
import InstagramProfileCard from "@/components/ui/InstagramProfileCard";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
export default function AnalyticsPage() {
  // const accountName = searchParams.account; // Retrieve the dynamic account name from the query
  const accountName = "name"; // Get the dynamic account name from the query
  const imageUrl = "https://via.placeholder.com/150"; // Replace with actual profile image URL
  const description = "This is a description or bio for the Instagram profile.";

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-6">
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <b>✨ Your Analytics</b>
        </AnimatedShinyText>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl">
        {/* Left Section: Tweet Card */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-md p-4">
        <InstagramProfileCard 
            imageUrl={imageUrl} 
            accountName={accountName} 
            description={description} 
          />
        </div>

        {/* Right Section: Text and Progress */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white rounded-lg shadow-md p-4">
          <div className="mb-4">
            <div className="text-2xl font-semibold text-gray-800 text-center">
              Your Brand Value
            </div>
          </div>
          {/* Circle Progress Bar */}
          <div className="relative flex items-center justify-center">
            <svg className="w-36 h-36" viewBox="0 0 36 36">
              <circle
                className="text-gray-200 stroke-current"
                strokeWidth="4"
                fill="none"
                cx="18"
                cy="18"
                r="16"
              ></circle>
              <circle
                className="text-blue-500 stroke-current"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                cx="18"
                cy="18"
                r="16"
                strokeDasharray="100"
                strokeDashoffset="30" // Example value, adjust dynamically
              ></circle>
            </svg>
            <span className="absolute text-lg font-semibold text-gray-800">70%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
