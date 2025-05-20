import { cn } from "@/lib/utils";
import Marquee from "@/components/ui/marquee";

const reviews = [
  {
    name: "Flowers Shop LA",
    username: "@flowersla",
    body: "It helped us understand our target niche better. Simple and super insightful.",
    img: "/shop1.png",
  },
  {
    name: "Vibe Coffee PL",
    username: "@vibecoffee",
    body: "We used it mostly for fun at first — now it’s part of our weekly content plan.",
    img: "/coffee1.png",
  },
  {
    name: "Studio Nova Design",
    username: "@studionova",
    body: "It gave us a fresh angle on what kind of content actually hits with our followers.",
    img: "/studio1.png",
  },
  {
    name: "Bark & Meow Pets",
    username: "@barkmeow",
    body: "Honestly didn’t expect it to work this well. We found a new audience segment.",
    img: "/pets1.png",
  },
  {
    name: "Slow Living Decor",
    username: "@slowliving",
    body: "Super aesthetic + practical. Helped us plan reels that actually get views.",
    img: "https://avatar.vercel.sh/slowliving",
  },
  {
    name: "Tech Mates App",
    username: "@techmates",
    body: "We were just testing it — now our whole content flow runs on it. Game changer.",
    img: "https://avatar.vercel.sh/techmates",
  },
];


const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background ">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
    </div>
  );
}
