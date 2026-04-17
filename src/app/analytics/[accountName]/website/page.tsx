'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BusinessDiscovery, LinkItem, mapBusinessDiscoveryToRequestGpt, MediaItem, SlideFlow, WebSiteResponseGpt } from "../data.mock";
import UseGptSlides from "../useGptSlides";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PublishPopup from "./popup";
import { resolveCachedAccountData } from "@/lib/instagram-cache";
import { getKvValue } from "@/lib/browser-db";

type PageProps = {
  params: Promise<{ accountName: string, hashtag: string }>;
};

export default function ProfilePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const username = resolvedParams.accountName;
  const [showPopup, setShowPopup] = useState(false);

  const [websiteModel, setWebsiteModel] = useState<WebSiteResponseGpt>();
  const [posts, setPosts] = useState<MediaItem[]>([]);
  const [slides, setSlides] = useState<SlideFlow[]>([]);
  const [igData, setIgData] = useState<BusinessDiscovery>();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try{
        setLoading(true);
        const cachedAccount = await resolveCachedAccountData(username);
        const links = await getKvValue<string>((cachedAccount?.accountKey ?? username)+"-links");
        const igData = cachedAccount?.igData;
        if (igData) {
          
          const website = igData.website;
          if(links != null) {
            setLinks(JSON.parse(links));
          }
          else{
            if(website){
              setLinks([{
                url: website
              } as LinkItem])
            }
          }
          setIgData(igData);
          const modelRequest = mapBusinessDiscoveryToRequestGpt(igData);
          const websiteModel =  await UseGptSlides(JSON.stringify(modelRequest));
  
          if(websiteModel != null){
            setWebsiteModel(websiteModel);
            setSlides(websiteModel.slidesFlow);
            setPosts(igData.media.data);
          }
        }
        else {
          router.push(`/analytics/${resolvedParams.accountName}`);
        }
      } catch (error) {
        console.error("Error parsing the data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (resolvedParams?.accountName) {
      fetchData(); 
    }
  }, [resolvedParams.accountName, router, username]);

  const linkClass =
    "bg-card text-foreground font-semibold py-4 rounded-full text-center border border-dashed border-border shadow-soft hover:shadow-md hover:scale-[1.02] transform transition text-lg";
  const gradientClass =
    "bg-gradient-to-br from-sky-50 via-fuchsia-50 to-amber-50 p-6 md:p-8 rounded-3xl shadow-soft border border-border/40 text-base text-foreground mb-8 max-w-3xl w-full";
  const btnClass =
    "mt-10 bg-brand-gradient text-white font-semibold py-4 px-8 rounded-full max-w-3xl w-full text-xl shadow-soft hover:opacity-90 transition";
  const picCoverClass =
    "rounded-3xl w-full md:w-1/2 object-cover max-h-96 shadow-soft border border-border/40 hover:shadow-md transition-shadow duration-300";
  
  
  if (loading) return <LoadingSpinner />;
  return (
  <div className="min-h-[calc(100vh-5rem)] bg-background px-4 py-8 sm:px-6 sm:py-10 flex flex-col items-center">
    <div className="text-center mb-6 max-w-3xl w-full">
        <img
      src={igData?.profile_picture_url}
      className="mx-auto w-28 h-28 rounded-full shadow-soft ring-4 ring-background"
    />
    <h1 className="text-2xl sm:text-3xl font-bold mt-3 text-foreground">
      <a
        href={`https://instagram.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        @{username}
      </a>
    </h1>

      <p className="text-base text-muted-foreground">{igData?.biography || "biography"}</p>
    </div>

    <div className={gradientClass}>
      <h3 className="font-semibold text-xl mb-3 text-foreground">👋 About </h3>
      <p>{websiteModel?.about  || "About me"}</p>
    </div>

    <div className="flex flex-col gap-12 mb-12 max-w-3xl w-full">
    {slides.slice(0, 4).map((slide, i) => {
  const post = posts.find(p => p.id === slide.mediaId);

  return (
    <div
      key={i}
      className={`flex flex-col md:flex-row items-center gap-6 ${
        i % 2 === 1 ? "md:flex-row-reverse" : ""
      }`}
    >
      {post && (
        <Image
          src={post.media_url}
          alt={`Post ${i}`}
          className={picCoverClass}
          width={1200}
          height={1200}
          unoptimized
        />
      )}
      <div className="w-full md:w-1/2">
        <h4 className="text-xl font-semibold mb-2 text-foreground">
          { "🌆" + slide.title || `🌆 Top Post #${i + 1}`}
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          {slide.text}
        </p>
      </div>
    </div>
  );
    })}

    </div>

    <div className={gradientClass}>
      <h3 className="font-semibold mb-3 text-xl text-foreground">✨ Fun fact</h3>
      <p>{websiteModel?.funFact  || "Do not have info"}</p>
    </div>

    <div className="flex flex-col space-y-4 w-full max-w-3xl">
      {links?.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          {link.title?.trim() || link.url.replace(/^https?:\/\//, "").split("/")[0]} ↗
        </a>
      ))}
    </div>

    <button
      onClick={() => setShowPopup(true)}
      className={btnClass}
      style={{
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      Publish/Edit Website
    </button>

    <p className="text-xs text-muted-foreground mt-12 max-w-3xl w-full text-center">
      This preview website was generated 💜 by BrandGram AI
    </p>
    {showPopup && (
      <PublishPopup
        username={username}
        onClose={() => setShowPopup(false)}
      />
    )}
  </div>
);

}

