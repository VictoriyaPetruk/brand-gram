// pages/about.tsx
import React from "react";

const GPT_PROMPTS = [
  {
    title: "Instagram analytics summary",
    prompt:
      "Analyze this Instagram account (posts, captions, hashtags, engagement) and give a summary: brand value, strengths, weak spots, top content types, ideal posting cadence, advices to raise engagement.",
  },
  {
    title: "Storytelling for a website",
    prompt:
      "Given this set of images and short captions, generate a 6-card storytelling sequence for a website hero carousel — include micro-copy for each card and a headline + subheadline.",
  },
];

const TECH_NOTES = [
  {
    title: "Frontend",
    prompt:
      "Next.js + TypeScript + shadcn/ui + magicui.design + ESLint. Deployed on Vercel.",
  },
  {
    title: "GPT API adapter",
    prompt:
      "Node.js API + used OpenAI API. Deployed on Vercel. Tokens saved on Vercel configs.",
  },
  {
    title: "Separate Instagram API for business accounts",
    prompt:
      "C# API running on AWS Lambda. Tokens stored securely in AWS Configuration.",
  },
];

export default function About(): JSX.Element {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <main className="max-w-6xl w-full bg-white rounded-2xl shadow-lg p-8 grid gap-8 lg:grid-cols-2">
          {/* Left column: hero + video */}
          <section className="space-y-6">
            <header>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                BrandGram — micro websites generated from your Instagram ✨
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Micro website generator powered by ChatGPT, tailored from your Instagram feed.
              </p>
            </header>
            <div className="flex items-center gap-4">
              <a
                href="mailto:hello@brandgram.example?subject=Interested%20in%20BrandGram%20code"
                className="inline-block px-6 py-3 bg-violet-600 text-white rounded-2xl shadow hover:opacity-95"
              >
                Contact us
              </a>
              <a href="#use-cases" className="text-sm text-gray-600 underline">
                Try BrandGram
              </a>
            </div>
            <div className="rounded-xl overflow-hidden bg-gray-100 mx-auto max-w-[320px]">
            <div className="aspect-[1032/1920]">
              <video
                className="w-full h-full object-contain"
                controls
                playsInline
                src="/brandgram.mp4"
                poster="/poster.jpg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Instagram preview</h3>
              <a href="https://www.instagram.com/brandgram_ai/"  className="text-sm text-gray-500"target="_blank" rel="noopener noreferrer">
                https://www.instagram.com/brandgram_ai/
              </a>

              {/* Placeholder frame for Instagram feed (replace with your embed/iframe or component) */}
              <div className="mt-4 border rounded-md overflow-hidden">
              <img
                src="/feed.jpg"
                alt="BrandGram Instagram preview"
                className="w-full h-106 object-cover"
              />
              </div>
            </div>
          
          </section>

          {/* Right column: Insta feed, features, prompts, customers */}
          <aside className="space-y-6">
            
          <div className="rounded-lg border p-4">
              <h3 className="font-semibold">What BrandGram does</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>• Generate a micro website with your links and real content from your Instagram </li>
                <li>• Storytelling technology based on your photos using ChatGpt prompts to make your website live.</li>
                <li>• Get general analititcs of a business acount using Facebook API</li>
                <li>• GPT deatiled analititcs of a business acount using OpenaAI API, GPT prompts.</li>
                <li>• Sales funnel (questionnaire) that leads to website preview without registration.</li>
              </ul>
            </div>
            
          <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Tech notes</h3>
              <div className="mt-3 space-y-2 text-sm">
                {TECH_NOTES.map((p) => (
                  <div key={p.title} className="bg-gray-50 rounded-md p-3">
                    <strong className="block">{p.title}</strong>
                    <code className="block text-xs mt-1 text-gray-600 break-words">{p.prompt}</code>
                  </div>
                ))}
              </div>
          </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">GPT prompts included</h3>
              <div className="mt-3 space-y-2 text-sm">
                {GPT_PROMPTS.map((p) => (
                  <div key={p.title} className="bg-gray-50 rounded-md p-3">
                    <strong className="block">{p.title}</strong>
                    <code className="block text-xs mt-1 text-gray-600 break-words">{p.prompt}</code>
                  </div>
                ))}
              </div>
            </div>

            <div id="use-cases" className="rounded-lg border p-4">
              <h3 className="font-semibold">Our customers and where to use it</h3>
              <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>
                  Small businesses — coffee shops, stores, studios that run active Instagram accounts and want a simple site without extra dev work.
                </li>
                <li>
                  Solo founders & creators — photographers, illustrators, influencers who want a landing page / portfolio with storytelling.
                </li>
                <li>Marketing agencies — fast demo sites for clients, A/B testing landing pages based on real content.</li>
              </ul>

              <p className="text-xs text-gray-500 mt-3">Why it works: it saves development time, uses real client content, and generates link bio.</p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">How to use</h3>
              <ol className="mt-3 list-decimal list-inside text-sm text-gray-700 space-y-1">
                <li>Type your Instagram Business account.</li>
                <li>Fill out the questions, add links, choose color.</li>
                <li>Wait until website will be generated, see preview</li>
                <li>Send us DM to publish your website.</li>
              </ol>
            </div>

            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">All rights reserved. Code is private on GitHub.</p>
            </div>
          </aside>
        </main>

        {/* Floating contact CTA at bottom-right */}
        <a
            className="fixed right-6 bottom-6 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-violet-600 text-white shadow-lg"
            href="https://mail.google.com/mail/?view=cm&fs=1&to=vikapetruk1234@gmail.com&su=Buy%20BrandGram%20code"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us to buy BrandGram"
          >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 7v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Contact us to buy the code and tool</span>
        </a>
      </div>
    </>
  );
}

