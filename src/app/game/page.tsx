"use client";
import { useState, useEffect } from "react";
import { Send, Laptop, X } from "lucide-react";

export default function Game(): JSX.Element {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagramVisible, setDiagramVisible] = useState(false);

  // Chat
  const [messages, setMessages] = useState<
    { id: number; text: string; sender: "bot" | "user" }[]
  >([]);

  // Prices modal
  const [showPrices, setShowPrices] = useState(false);

  // === Assumptions & rough monthly pricing (edit here) ===
  const priceItems = [
    { name: "Amazon CloudFront (100 GB data)", price: 8.5, note: "≈$0.085/GB" },
    {
      name: "CloudFront HTTPS requests (~200k)",
      price: 0.2,
      note: "≈$0.01 per 10k",
    },
    {
      name: "Amazon S3 Standard storage (50 GB)",
      price: 1.15,
      note: "$0.023/GB-mo",
    },
    {
      name: "Amazon API Gateway (REST, 200k req)",
      price: 0.7,
      note: "≈$3.5 / 1M",
    },
    {
      name: "AWS Lambda (~200k @256MB/100ms)",
      price: 0.29,
      note: "compute + requests",
    },
    {
      name: "Amazon DynamoDB on-demand",
      price: 0.5,
      note: "1M reads + 200k writes + ~1GB",
    },
    {
      name: "Amazon Cognito (5k MAU)",
      price: 0.0,
      note: "Essentials free tier",
    },
    {
      name: "AWS CodePipeline (~150 action-min)",
      price: 0.3,
      note: "$0.002/action-min",
    },
    { name: "AWS CodeBuild (small, ~60 min)", price: 0.3, note: "≈$0.005/min" },
    {
      name: "AWS Fargate load test (1h, 1 vCPU + 2GB)",
      price: 0.05,
      note: "≈$0.04 vCPU-h + $0.004/GB-h",
    },
    { name: "Amazon SQS (≤1M req)", price: 0.0, note: "Free tier" },
    { name: "Amazon ECR storage (5 GB)", price: 0.5, note: "$0.10/GB-mo" },
    {
      name: "Amazon CloudWatch Logs (~1 GB ingest)",
      price: 0.5,
      note: "≈$0.50/GB ingest",
    },
  ];
  const total = priceItems.reduce((s, i) => s + i.price, 0);

  useEffect(() => {
    // Автосообщения при загрузке страницы
    const timer = setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: "Hello.👋 I am your AI Cloud Architect helper.",
          sender: "bot",
        },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 2,
            text: "What kind of app do you need to publish to Cloud?",
            sender: "bot",
          },
        ]);
      }, 1500);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: 3, text: "Text me.", sender: "bot" },
        ]);
      }, 3000);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 4,
            text: "I will try to help you with a quick prototype.",
            sender: "bot",
          },
        ]);
      }, 4500);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (!input) return;
    setLoading(true);
    setDiagramVisible(false);

    // Отправка сообщения в чат
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: input, sender: "user" },
    ]);
    setInput("");

    setTimeout(() => {
      setLoading(false);
      setDiagramVisible(true);
    }, 2000); // simulate generation
  };

  return (
    <div className='flex bg-white h-screen'>
      {/* Left panel */}
      <div className='flex-1 flex flex-col justify-center items-center bg-gray-100'>
        <h1 className='text-3xl font-bold text-orange-800'>
          Cloud Architecture
        </h1>

        {!loading && !diagramVisible && (
          <div className='mt-6 max-w-2xl px-6'>
            Please describe your use case in the chat on the right.
          </div>
        )}

        {loading && (
          <p className='text-orange-700 text-xl mt-6'>Generating...</p>
        )}

        {diagramVisible && (
          <img
            src='/solution-1-diagram.jpg'
            alt='Cloud Architecture'
            width={735}
            height={490}
            className='p-4 rounded-lg shadow-lg'
          />
        )}

        {diagramVisible && (
          <div className='mt-4 flex items-center gap-3'>
            <a
              href='https://aws.amazon.com/console/'
              target='_blank'
              className='px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition'
            >
              Publish
            </a>

            {/* See prices button */}
            <button
              onClick={() => setShowPrices(true)}
              className='px-6 py-2 bg-white text-orange-700 border border-orange-400 font-semibold rounded-lg hover:bg-orange-50 transition inline-flex items-center gap-2'
            >
              See prices
            </button>
          </div>
        )}
      </div>

      {/* Right panel = Chat */}
      <div className='w-1/3 bg-white border-l border-orange-300 flex flex-col'>
        {/* Header */}
        <div className='flex items-center gap-2 border-b p-3 bg-orange-50'>
          <Laptop className='text-orange-600' />
          <div className='flex flex-col'>
            <span className='font-bold text-orange-800'>
              CloudBlocks AI bot
            </span>
            <span className='text-sm text-gray-500'>@Official</span>
          </div>
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <img
                  src='/cat-avatar.png'
                  alt='Bot Avatar'
                  className='w-8 h-8 rounded-full mr-2 self-end'
                />
              )}
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  msg.sender === "user"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className='flex items-center border-t p-2'>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='flex-1 border border-orange-300 rounded-lg p-2 mr-2'
            placeholder='Type your message...'
          />
          <button
            onClick={handleSubmit}
            className='bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition'
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Prices Modal */}
      {showPrices && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-xl'>
            <div className='flex items-center justify-between p-4 border-b'>
              <h3 className='text-lg font-semibold text-orange-800'>
                Estimated monthly cost
              </h3>
              <button
                onClick={() => setShowPrices(false)}
                className='p-1 rounded hover:bg-gray-100'
              >
                <X size={18} />
              </button>
            </div>

            <div className='p-4 max-h-[70vh] overflow-y-auto'>
              <ul className='space-y-2'>
                {priceItems.map((i) => (
                  <li
                    key={i.name}
                    className='flex items-start justify-between gap-3'
                  >
                    <div className='text-sm'>
                      <div className='font-medium'>{i.name}</div>
                      {i.note && <div className='text-gray-500'>{i.note}</div>}
                    </div>
                    <div className='font-semibold tabular-nums'>
                      ${i.price.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>

              <div className='mt-4 border-t pt-3 flex items-center justify-between'>
                <div className='text-sm font-medium'>Total</div>
                <div className='text-lg font-bold tabular-nums'>
                  ${total.toFixed(2)}
                </div>
              </div>

              <p className='mt-3 text-xs text-gray-500'>
                Region: <b>US East (N. Virginia)</b>. Numbers are illustrative;
                real bills depend on usage, region, and discounts.
              </p>
            </div>

            <div className='p-3 border-t flex justify-end'>
              <button
                onClick={() => setShowPrices(false)}
                className='px-4 py-2 bg-orange-500 text-white rounded-lg'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
