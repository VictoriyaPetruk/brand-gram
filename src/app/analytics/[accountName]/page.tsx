"use client";
import { use, useEffect, useState } from "react";
import InstagramProfileCard from "@/components/ui/InstagramProfileCard";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { AnalyticsCard } from "./analytics-card";
import { MessageSquare } from "lucide-react";
import { GptAnalytics, PromtModel, mockData } from "./data.mock";
import { BusinessDiscovery } from "./data.mock";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import useGptAnalytics from "./useGptAnalytics";
import { ContentSlider } from "./content-slider";
import Header from "@/components/header";
import generatePrompt from "./generatePrompt";

type AnalyticsPageProps = {
  params: Promise<{ accountName: string }>;
};

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const [Igdata, setIgData] = useState<BusinessDiscovery | null>(null);
  const [gptData, setGptData] = useState<GptAnalytics | null>(null);
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [isModelValid, setIsModelValid] = useState(true);
  const [Message, setMessage] = useState("");
  const [gptRef, setGptRef] = useState("https://chat.openai.com/?model=text-davinci-002-render-sha&prompt=");

  const router = useRouter();
  const [showContentSlider, setShowContentSlider] = useState(false); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        const response = await fetch(
          `https://nmaucysl2df74e7574m33y3ykm0hfdoh.lambda-url.eu-central-1.on.aws/api/igbrand/ig?username=${resolvedParams.accountName}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (!response.ok) {
          throw new Error("Something went wrong");
        }
  
        const data = await response.json();
        if(data == null || data == undefined){
          setMessage("The account name is not correct or server is not responding. Try later.");
          setIsModelValid(false);
        }
        else {
          const analytics = await useGptAnalytics(JSON.stringify(data.business_discovery));
          if(analytics == null  || analytics == undefined){
            setMessage("The Chat Gpt is not responding. Reload the page several times");
            setIsModelValid(false);
          }
          localStorage.setItem("posts", JSON.stringify(analytics?.PostsIdeas));
          console.log(analytics);
          setIgData(data.business_discovery);
          setGptData(analytics);
          setIsModelValid(true);
          const promtModel: PromtModel = {
            Username: data.business_discovery?.username ?? "",
            Name: data.business_discovery?.name ?? "",
            Follows_count: data.business_discovery?.follows_count ?? 0,
            Followers_count: data.business_discovery?.followers_count ?? 0,
            Description: data.business_discovery?.biography ?? "",
            FunFact: analytics?.FunFact ?? "",
            MainAudience: analytics?.MainAudience ?? "",
            AverageEngagementRate: analytics?.AverageEngagementRate ?? 0,
            AveragePostLikes: analytics?.AveragePostLikes ?? 0,
            AveragePostComments: analytics?.AveragePostComments ?? 0,
            ContentStyle: analytics?.ContentStyle ?? "",
          };
          setGptRef(`https://chat.openai.com/?model=text-davinci-002-render-sha&prompt=${generatePrompt(JSON.stringify(promtModel))}`);
        }
      
      } catch (error) {
        console.error("Error parsing the data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (resolvedParams?.accountName) {
      fetchData(); // ❌ remove `await` from here
    }
  }, [resolvedParams?.accountName, isModelValid]);  

  if (loading) return <LoadingSpinner />;

  // Conditional rendering if the model is invalid
  if (isModelValid == false) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-6 gap-4">
        <div className="text-xl text-red-500 font-semibold mb-4">
          {Message || "The model data is invalid."}
        </div>
        <button
          onClick={
            () => router.back()
            // ()=>console.log("hi")
          } // Go back to the previous page
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Return Back
        </button>
      </div>
    );
  }
  
  const bestPost = Igdata?.media?.data?.reduce((max, post) => {
    return post.like_count > max.like_count ? post : max;
  }, Igdata?.media?.data?.[0]);
  
  return (
    <>
    <Header/>
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-6 gap-4">
      <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
        <b>✨ Your Analytics</b>
      </AnimatedShinyText>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl">
        {/* Left Section: Instagram Profile Card */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-md p-4">
          <InstagramProfileCard
            imageUrl={Igdata?.profile_picture_url as string}
            accountName={resolvedParams.accountName}
            description={Igdata?.biography as string}
            followers={Igdata?.followers_count as number}
            followings={Igdata?.follows_count as number}
            mediaCount={Igdata?.media_count as number}
            avgLikes={gptData?.AveragePostLikes as number}
            averageEngagementRate={gptData?.AverageEngagementRate as number}
            averageCommentsPerPost={gptData?.AveragePostComments as number}
          />
        </div>

        {/* Right Section: Analytics Data */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between bg-white rounded-lg shadow-md p-4">
          <div>
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
                  className="text-black-500 stroke-current"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="16"
                  strokeDasharray="100"
                  strokeDashoffset={100 - (gptData?.BrandValue ?? 0)} // Adjust dynamically
                  transform="rotate(-90 18 18)"
                ></circle>
              </svg>
              <span className="absolute text-lg font-semibold text-gray-800">
                {`${gptData?.BrandValue ?? 0}%`}
              </span>
            </div>
          </div>
            {bestPost && (
              <div className="w-full mt-4 justify-bottom">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  The best latest post analysis
                </h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-medium">{bestPost.media_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Likes</span>
                    <span className="font-medium">
                      {bestPost.like_count === 0 ? "hidden" : bestPost.like_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comments</span>
                    <span className="font-medium">{bestPost.comments_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Caption</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{bestPost.caption}</span>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
      <AnalyticsCard gptAnalitics={gptData} />
      <div className="mt-8 w-full max-w-5xl flex justify-center gap-4">
  <button
    onClick={() => router.push(`/analytics/${resolvedParams.accountName}/dashboard/${gptData?.Hashtag}`)}
    className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
  >
    Generate Content
  </button>
  <button
    onClick={() => router.push(`/analytics/${resolvedParams.accountName}/posts-ideas`)}
    className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
  >
    Show Post Ideas
  </button>
  <button
    // onClick={() => router.push(`/analytics/${resolvedParams.accountName}/competitors`)}
    className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
  >
    <a
  href={gptRef}
  target="_blank"
>
    Open ChatGpt with the generated prompt
    </a>
  </button>
  
</div>
{/* <ContentSlider accountName={resolvedParams.accountName} jsonContent={JSON.stringify(gptData)} /> */}
    </div>
    </>
  );
}