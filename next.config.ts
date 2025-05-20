import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
     domains: [
      'oaidalleapiprodscus.blob.core.windows.net',
      'www.pexels.com',
      'images.pexels.com',
      // FRA (Frankfurt)
      'scontent-fra5-1.xx.fbcdn.net',
      'scontent-fra5-2.xx.fbcdn.net',
      'scontent-fra3-1.xx.fbcdn.net',
      'scontent-fra3-2.xx.fbcdn.net',
     
      // CDG (Paris)
      'scontent-cdg1-1.xx.fbcdn.net',
      'scontent-cdg1-2.xx.fbcdn.net',
      'scontent-cdg2-1.xx.fbcdn.net',
      'scontent-cdg2-2.xx.fbcdn.net',
    
      // AMS (Amsterdam)
      'scontent-ams4-1.xx.fbcdn.net',
      'scontent-ams4-2.xx.fbcdn.net',
      'scontent-ams2-1.xx.fbcdn.net',
      'scontent-ams2-2.xx.fbcdn.net',
    
      // VIE (Vienna)
      'scontent-vie1-1.xx.fbcdn.net',
      'scontent-vie1-2.xx.fbcdn.net',
    
      // WAW (Warsaw)
      'scontent-waw1-1.xx.fbcdn.net',
      'scontent-waw1-2.xx.fbcdn.net',
    
      // LHR (London)
      'scontent-lhr8-1.xx.fbcdn.net',
      'scontent-lhr8-2.xx.fbcdn.net',
    
      // DUB (Dublin)
      'scontent-dub4-1.xx.fbcdn.net',
      'scontent-dub4-2.xx.fbcdn.net',
    
      // Any other fallback
      'scontent.xx.fbcdn.net',
    ],    
  },
};

export default nextConfig;
