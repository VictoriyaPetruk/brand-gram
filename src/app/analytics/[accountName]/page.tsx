"use client";
import { use, useEffect, useState } from "react";
import InstagramProfileCard from "@/components/ui/InstagramProfileCard";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { AnalyticsCard } from "./analytics-card";
import { GptAnalytics, mapBusinessDiscoveryToRequestGpt } from "./data.mock";
import { BusinessDiscovery } from "./data.mock";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import UseGptAnalytics from "./useGptAnalytics";
import Header from "@/components/header";
import {
  getCachedGptAnalytics,
  resolveCachedAccountData,
  setCachedGptAnalytics,
  setCachedIgData,
} from "@/lib/instagram-cache";
import { addSavedAccount, isAccountSaved } from "@/lib/saved-accounts";

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
  const [accountSaved, setAccountSaved] = useState(false);

  const router = useRouter();
  
  
  useEffect(() => {
    const fetchData = async () => {
      const routeAccount = resolvedParams.accountName.trim().toLowerCase();
      const cachedAccount = await resolveCachedAccountData(routeAccount);

      const applyContext = async (igContext: BusinessDiscovery, accountKey: string) => {
        const existingAnalytics = await getCachedGptAnalytics(accountKey);
        let analytics = existingAnalytics;
        if (!analytics) {
          const modelRequest = mapBusinessDiscoveryToRequestGpt(igContext);
          analytics = await UseGptAnalytics(JSON.stringify(modelRequest));
          if (analytics) {
            await setCachedGptAnalytics(accountKey, analytics);
          }
        }

        if (!analytics) {
          setMessage("The Chat Gpt is not responding. Reload the page several times");
          setIsModelValid(false);
          return;
        }

        await setCachedIgData(accountKey, igContext);
        setIgData(igContext);
        setGptData(analytics);
        setIsModelValid(true);
      };

      try {
        setLoading(true);
  
        const response = await fetch(
          `https://nmaucysl2df74e7574m33y3ykm0hfdoh.lambda-url.eu-central-1.on.aws/api/igbrand/ig?username=${routeAccount}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`Instagram API request failed (${response.status} ${response.statusText})`);
        }
  
        const data = await response.json();
        if(data == null || data == undefined){
          if (cachedAccount) {
            await applyContext(cachedAccount.igData, cachedAccount.accountKey);
          } else {
            setMessage("The account name is not correct or it is not a business account. Change it in settings and try again.");
            setIsModelValid(false);
          }
        }
        else {
          await applyContext(data.business_discovery, routeAccount);
        }
      
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error loading analytics data:", errorMessage, error);
        if (cachedAccount) {
          await applyContext(cachedAccount.igData, cachedAccount.accountKey);
        } else {
          setMessage(`Could not load this account and no local cache was found. ${errorMessage}`);
          setIsModelValid(false);
        }
      } finally {
        setLoading(false);
      }
    };
  
    if (resolvedParams?.accountName) {
      fetchData(); 
    }
  }, [resolvedParams?.accountName, isModelValid]);  

  useEffect(() => {
    let cancelled = false;
    const activeAccountName = (Igdata?.username ?? resolvedParams.accountName ?? "").trim().toLowerCase();
    void isAccountSaved(activeAccountName).then((saved) => {
      if (!cancelled) {
        setAccountSaved(saved);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [Igdata?.username, resolvedParams.accountName]);

  if (loading) return <LoadingSpinner />;
  if (isModelValid == false) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background p-6 gap-4">
        <div className="text-xl text-red-500 font-semibold mb-4">
          {Message || "The model data is invalid."}
        </div>
        <button
          onClick={
            () => router.back()
          } 
          className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90"
        >
          Return Back
        </button>
      </div>
    );
  }
  
  const bestPost = Igdata?.media?.data?.reduce((max, post) => {
    return post.like_count > max.like_count ? post : max;
  }, Igdata?.media?.data?.[0]);

  const handleSaveAccount = async () => {
    const activeAccountName = (Igdata?.username ?? resolvedParams.accountName ?? "").trim().toLowerCase();
    if (!activeAccountName) return;
    await addSavedAccount(activeAccountName);
    setAccountSaved(true);
  };
  
  return (
    <>
    <Header/>
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-5rem)] bg-background px-4 py-6 sm:px-6 sm:py-8 gap-4">
      <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
        <b>✨ Your Analytics</b>
      </AnimatedShinyText>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="w-full lg:col-span-7 bg-card rounded-3xl shadow-soft border border-border/50 p-4 md:p-6">
          <InstagramProfileCard
            imageUrl={Igdata?.profile_picture_url as string}
            accountName={resolvedParams.accountName}
            description={Igdata?.biography as string}
            followers={Igdata?.followers_count as number}
            followings={Igdata?.follows_count as number}
            mediaCount={Igdata?.media_count as number}
            onSaveAccount={handleSaveAccount}
            isAccountSaved={accountSaved}
          />
        </div>
        <div className="w-full lg:col-span-5 bg-card rounded-3xl shadow-soft border border-border/50 p-6">
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-5">
            <div className="text-center text-2xl font-semibold text-foreground">
              Your Brand Value
            </div>
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="analyticsBrandRing" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6eb5ff" />
                    <stop offset="33%" stopColor="#a287f4" />
                    <stop offset="66%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
                <circle
                  className="stroke-slate-200 text-slate-200 stroke-current"
                  strokeWidth="4"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="16"
                ></circle>
                <circle
                  stroke="url(#analyticsBrandRing)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="16"
                  strokeDasharray="100"
                  strokeDashoffset={100 - (gptData?.BrandValue ?? 0)} 
                  transform="rotate(-90 18 18)"
                ></circle>
              </svg>
              <span className="absolute text-lg font-semibold text-foreground">
                {`${gptData?.BrandValue ?? 0}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
      <AnalyticsCard
        gptAnalitics={gptData}
        bestPost={bestPost ?? null}
        mediaPosts={Igdata?.media?.data ?? []}
        followersCount={Igdata?.followers_count ?? 0}
      />
      <div className="mt-8 w-full max-w-5xl flex flex-wrap justify-center gap-4">
  <div 
  onClick={() => {
    router.push(`/analytics/${resolvedParams.accountName}/flow`)

  }}
 className="bg-brand-gradient border-0 text-white text-center px-6 py-5 rounded-3xl mb-6 cursor-pointer shadow-soft transition-opacity hover:opacity-90 animate-pulse"
>
  <p className="text-lg font-semibold">
  ✨ Generate 5 Custom Post Ideas for your ICPs
  </p>
</div>
    </div>
    </div>
    </>
  );
}