import Image from "next/image";
import React from "react";

interface InstagramProfileCardProps {
  imageUrl: string;
  accountName: string;
  description: string;
  followers: number;
  followings: number;
  mediaCount: number;
  onSaveAccount?: () => void;
  isAccountSaved?: boolean;
}

const InstagramProfileCard: React.FC<InstagramProfileCardProps> = ({
  imageUrl,
  accountName,
  description,
  followers, 
  followings,
  mediaCount,
  onSaveAccount,
  isAccountSaved = false,
}) => {
  const handle = accountName.startsWith("@") ? accountName : `@${accountName}`;

  const stats = [
    { label: "Followers", value: followers },
    { label: "Posts", value: mediaCount },
    { label: "Following", value: followings },
  ];

  return (
    <div className="rounded-3xl border border-border/60 bg-background/40 p-5 md:p-6">
      <div className="flex items-start gap-4">
        <Image
          src={imageUrl}
          alt="Profile"
          className="h-20 w-20 rounded-full object-cover ring-4 ring-background md:h-24 md:w-24"
          width={96}
          height={96}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-semibold leading-tight text-foreground">{accountName}</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{handle}</p>
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground md:text-base">{description}</p>
          </div>
        </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border/70 bg-card p-3 text-center">
            <p className="text-lg font-semibold bg-brand-gradient bg-clip-text text-transparent md:text-xl">{stat.value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      {onSaveAccount && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onSaveAccount}
            disabled={isAccountSaved}
            className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAccountSaved ? "Saved account" : "Save account"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InstagramProfileCard;
