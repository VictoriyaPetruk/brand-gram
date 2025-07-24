'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessDiscovery, LinkItem, mapBusinessDiscoveryToRequestGpt, MediaItem, SlideFlow, WebSiteModelBlog, WebSiteResponseGpt } from "../data.mock";
import UseGptSlides from "../useGptSlides";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PublishPopup from "./popup";

type PageProps = {
  params: Promise<{ accountName: string, hashtag: string }>;
};

export default function ProfilePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const username = resolvedParams.accountName;
  const color = localStorage.getItem(username+"-color") || "purple";
  const [showPopup, setShowPopup] = useState(false);

  const shadowHoverColor = {
    blue: "hover:shadow-blue-500",
    purple: "hover:shadow-purple-500",
    red: "hover:shadow-red-500",
    green: "hover:shadow-green-500",
    yellow: "hover:shadow-yellow-500"
  }[color];
  

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
        const links = localStorage.getItem(username+"-links");
        const igData = localStorage.getItem(username+"-igdata");
        if (igData) {
          
          let website = (JSON.parse(igData) as BusinessDiscovery).website;
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
          setIgData(JSON.parse(igData));
          var modelRequest = mapBusinessDiscoveryToRequestGpt(JSON.parse(igData));
          const websiteModel =  await UseGptSlides(JSON.stringify(modelRequest));
  
          if(websiteModel != null){
            setWebsiteModel(websiteModel);
            setSlides(websiteModel.slidesFlow);
            setPosts((JSON.parse(igData) as BusinessDiscovery).media.data);
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
  }, [username]);

  const handlePublishClick = () => {
    alert("To publish and claim your website, message us on Instagram @brandIg with the text:\n\n'I want to link the website for my account (" + username + ")'.");
  };

  const linkClass = `bg-white text-${color}-800 font-semibold py-4 rounded-full text-center
  shadow-md ${shadowHoverColor} hover:scale-105 transform transition text-lg`;
  const gradientClass = `bg-gradient-to-r from-${color}-50 to-${color}-100 p-6 rounded-xl shadow-lg text-base text-gray-800 mb-8 max-w-3xl w-full`;
  const btnClass = `mt-10 bg-${color}-600 hover:bg-${color}-700 hover:shadow-lg hover:shadow-${color}-500 transition text-white font-semibold py-4 px-8 rounded-full max-w-3xl w-full text-xl`;
  const picClass = `text-${color}-600 font-medium mt-2 inline-block hover:text-${color}-500 hover:underline transition-colors duration-300`;
  const picCoverClass = `rounded-xl w-full md:w-1/2 object-cover max-h-96 shadow-md ${shadowHoverColor} transition-shadow duration-300`;
  
  
  if (loading) return <LoadingSpinner />;
  return (
  <div className="bg-[#FFFFFF] min-h-screen px-6 py-10 flex flex-col items-center">
    <div className="text-center mb-6 max-w-3xl w-full">
        <img
      src={igData?.profile_picture_url}
      className="mx-auto w-28 h-28 rounded-full shadow-lg"
    />
    <h1 className="text-3xl font-bold mt-3 text-black">
      <a
        href={`https://instagram.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        @{username}
      </a>
    </h1>

      <p className="text-base text-gray-600">{igData?.biography || "biography"}</p>
    </div>

    <div className={gradientClass}>
      <h3 className="font-semibold text-xl mb-3 text-gray-800">👋 About </h3>
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
        <img
          src={post.media_url}
          alt={`Post ${i}`}
          className={picCoverClass}
        />
      )}
      <div className="w-full md:w-1/2">
        <h4 className="text-xl font-semibold mb-2 text-black-700">
          { "🌆" + slide.title || `🌆 Top Post #${i + 1}`}
        </h4>
        <p className="text-gray-700 leading-relaxed">
          {slide.text}
        </p>
        {/* {post && (
          <a
            href={`https://www.instagram.com/p/${post.id}/`}
            className={picClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            View post ↗
          </a>
        )} */}
      </div>
    </div>
  );
    })}

    </div>

    <div className={gradientClass}>
      <h3 className="font-semibold mb-3 text-xl text-black-700">✨ Fun fact</h3>
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

    <p className="text-xs text-gray-400 mt-12 max-w-3xl w-full text-center">
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

