// pages/about.tsx
import Header from "@/components/header";
import React from "react";

const About = () => {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-100 p-10 text-gray-800">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About This Project</h1>
        <p className="text-lg leading-7">
          This platform was created as an educational project to explore building OpenAI-powered agents and tools.
        </p>
        <p className="mt-4 text-lg leading-7">
          It uses the public Meta (Facebook) API for demonstration purposes only and is not a real business or commercial product.
        </p>
        <p className="mt-4 text-lg leading-7">
          The goal was to experiment with AI + social media analytics and understand how generative tools can assist creators, brands, and small businesses.
        </p>
        <p className="mt-4 text-sm text-gray-500 italic">
          All names, reviews, and visuals are fictional or AI-generated and used solely for prototyping.
        </p>
      </div>
    </div>
    </>
  );
};

export default About;
