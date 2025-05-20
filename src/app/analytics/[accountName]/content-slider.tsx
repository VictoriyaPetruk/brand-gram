'use client';

// import LoadingSpinner from '@/components/ui/LoadingSpinner';
// import 'keen-slider/keen-slider.min.css';
// import Image from 'next/image';
// import { useEffect, useState } from 'react';

// type ContentSliderProps = {
//   accountName: string;
//   jsonContent: string;
// };

// export const ContentSlider = ({ accountName, jsonContent }: ContentSliderProps) => {
//   const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
//   const [loadingImage, setLoadingImage] = useState(true);
//   // const [sliderRef, sliderInstanceRef] = useKeenSlider<HTMLDivElement>({
//   //   loop: true,
//   //   mode: 'snap',
//   //   slides: { perView: 1, spacing: 15 },
//   // });

//   useEffect(() => {
//     const generateImage = async () => {
//       try {
//         setLoadingImage(true);
//         const res = await fetch('https://api.openai.com/v1/images/generations', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: ``, // Make sure to set your API key in Vercel environment variables
//           },
//           body: JSON.stringify({
//             prompt: `Generate posts for ${accountName}'s Instagram account. minimal, soft colors. Use this data: ${jsonContent.slice(0, 800)}`, // Update the prompt with dynamic username
//             n: 2,
//             size: '512x512'
//           }),
//         });

//         const data = await res.json();
//         console.log(data);
//         setGeneratedImages(data?.data?.map((image: any) => image.url));
//         setLoadingImage(false);
//       } catch (error) {
//         console.error('Error generating image:', error);
//       } finally {
//         setLoadingImage(false);
//       }
//     };

//     const getPexelsImage =  async (page = 1, number = 0) => {
//         const url = `https://api.pexels.com/v1/search?query=programming&per_page=10&page=${page}`;
      
//         try {
//           const response = await fetch(url, {
//             headers: {
//               Authorization: "",
//             },
//           });
      
//           if (response.ok) {
//             const data = await response.json();
//             // setGeneratedImages(data?.data?.map((image: any) => image.url))
//             setGeneratedImages(data?.photos.map((image: any) => image.src.original));
//             console.log(data);
//             return data.photos[number]?.src?.medium || null;
//           } else {
//             console.error(`Pexels API error: ${response.status}`);
//             return null;
//           }
//         } catch (error) {
//           console.error('Error fetching from Pexels:', error);
//           return null;
//         }
//       }

//     if (accountName) {
//       generateImage();
//     }
//   }, [accountName]);

//   if (generatedImages == null || generatedImages == undefined) return <LoadingSpinner />;

//   const mockTemplates = [
//     {
//       id: 1,
//       image: '/violetLogo_w.png',
//       description: 'Use this layout to highlight product features in a clean format.',
//     },
//     {
//       id: 2,
//       image: '/violetLogo_w.png',
//       description: 'Perfect for storytelling — great engagement with longer captions.',
//     },
//     {
//       id: 3,
//       image: '/violetLogo_w.png',
//       description: 'High-contrast, bold vibe for attention-grabbing announcements.',
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
//       <h1 className="text-3xl font-bold mb-8">📸 Content Ideas</h1>

//       <div ref={sliderRef} className="keen-slider w-full max-w-xl">
//         {generatedImages.map((imageUrl, index) => (
//             <div className="keen-slider__slide flex flex-col items-center" key={index}>
//                 <Image
//                 src={imageUrl}
//                 alt={`Generated Image ${index + 1}`}
//                 width={500}
//                 height={350}
//                 className="rounded-xl shadow-lg mb-4"
//                 />
//                 <p className="text-center text-gray-700 text-lg px-4">{mockTemplates[index]?.description}</p>
//             </div>
//             ))}
//       </div>

//       {/* Slider Buttons */}
//       <div className="mt-6 flex gap-4">
//         <button
//           onClick={() => sliderInstanceRef.current?.prev()}
//           className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
//         >
//           ⬅️ Prev
//         </button>
//         <button
//           onClick={() => sliderInstanceRef.current?.next()}
//           className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
//         >
//           Next ➡️
//         </button>
//       </div>
//     </div>
//   );
// };
