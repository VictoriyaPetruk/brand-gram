// components/ui/InstagramProfileCard.tsx

import React from "react";

interface InstagramProfileCardProps {
  imageUrl: string;
  accountName: string;
  description: string;
}

const InstagramProfileCard: React.FC<InstagramProfileCardProps> = ({ imageUrl, accountName, description }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Profile Image */}
      <img
        src={imageUrl}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover mb-4"
      />
      
      {/* Account Name */}
      <div className="text-xl font-semibold text-gray-800">{accountName}</div>
      
      {/* Description */}
      <div className="text-sm text-gray-600 text-center mt-2">{description}</div>
    </div>
  );
};

export default InstagramProfileCard;
