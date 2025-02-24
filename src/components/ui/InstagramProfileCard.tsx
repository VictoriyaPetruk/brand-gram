import Image from "next/image";
import React from "react";
import { TrendingUp } from "lucide-react";

interface InstagramProfileCardProps {
  imageUrl: string;
  accountName: string;
  description: string;
}

const InstagramProfileCard: React.FC<InstagramProfileCardProps> = ({
  imageUrl,
  accountName,
  description,
}) => {
  return (
    <div className='flex flex-col items-center'>
      {/* Profile Image */}
      <Image
        src={imageUrl}
        alt='Profile'
        className='w-24 h-24 rounded-full object-cover mb-4'
        width={96}
        height={96}
      />

      {/* Account Name */}
      <div className='text-2xl font-semibold text-gray-800'>{accountName}</div>

      {/* Description */}
      <div className='text-gray-600 text-center mt-2'>{description}</div>
      <div className='w-full mt-4'>
        {/* Metrics Analysis Section */}
        <div>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Key Metrics
          </h3>
          <div className='mt-4 grid gap-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-muted-foreground'>Followers</p>
                <p className='text-2xl font-semibold'>531</p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground'>Following</p>
                <p className='text-2xl font-semibold'>103</p>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Total Posts</span>
                <span className='font-medium'>48</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Average ER</span>
                <span className='font-medium'>2.8%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  Avg. Likes per Post
                </span>
                <span className='font-medium'>~15</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Estimated Reach</span>
                <span className='font-medium'>53-80 views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramProfileCard;
