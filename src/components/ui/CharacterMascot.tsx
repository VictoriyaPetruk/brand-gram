'use client';

import { useMemo } from 'react';

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

function getDynamicConfig(hexColor: string) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const light = `rgb(${Math.min(255, Math.round(r + (255 - r) * 0.5))},${Math.min(255, Math.round(g + (255 - g) * 0.5))},${Math.min(255, Math.round(b + (255 - b) * 0.5))})`;
  const dark = `rgb(${Math.round(r * 0.7)},${Math.round(g * 0.7)},${Math.round(b * 0.7)})`;
  return {
    label: 'Session',
    sublabel: 'Keep going!',
    bodyGradient: [light, hexColor, dark] as [string, string, string],
    glowColor: `rgba(${r},${g},${b},0.4)`,
    glowColorStrong: `rgba(${r},${g},${b},0.12)`,
    textColor: hexColor,
    auraClass: 'mascot-aura-happy',
    bodyClass: 'mascot-body-happy',
  };
}

export type SessionType = 'work' | 'study' | 'sport' | 'hobby';

export function detectSessionType(areaName: string): SessionType | undefined {
  const n = areaName.toLowerCase();
  if (/work|job|career|project|business|office|coding|programming|develop/.test(n)) return 'work';
  if (/study|learn|educat|research|course|school|read|book|university/.test(n)) return 'study';
  if (/sport|gym|fit|run|exercise|workout|train|yoga|swim|health|cycling|bike|life/.test(n)) return 'sport';
  if (/hobby|art|music|game|cook|garden|creat|craft|draw|paint|photo|startup/.test(n)) return 'hobby';
  return undefined;
}

interface CharacterMascotProps {
  energy: number;
  sessionType?: SessionType;
  size?: 'normal' | 'compact' | 'large';
  areaColor?: string;
  showSublabel?: boolean;
  sessionHours?: { committed: number; planned: number };
}

type MoodType = 'inspired' | 'happy' | 'tired' | 'sad';

function getMood(energy: number): MoodType {
  if (energy >= 8) return 'inspired';
  if (energy >= 6) return 'happy';
  if (energy >= 3) return 'tired';
  return 'sad';
}

const MOOD_CONFIG = {
  inspired: {
    label: 'Inspired',
    sublabel: 'Full of energy!',
    bodyGradient: ['#a5f3fc', '#7dd3fc', '#818cf8'] as [string, string, string],
    glowColor: 'rgba(99,210,255,0.45)',
    glowColorStrong: 'rgba(99,210,255,0.15)',
    auraClass: 'mascot-aura-inspired',
    bodyClass: 'mascot-body-inspired',
    textColor: '#34d399',
  },
  happy: {
    label: 'Happy',
    sublabel: 'Feeling good',
    bodyGradient: ['#c4b5fd', '#a78bfa', '#818cf8'] as [string, string, string],
    glowColor: 'rgba(167,139,250,0.35)',
    glowColorStrong: 'rgba(167,139,250,0.1)',
    auraClass: 'mascot-aura-happy',
    bodyClass: 'mascot-body-happy',
    textColor: '#a78bfa',
  },
  tired: {
    label: 'Tired',
    sublabel: 'Need some rest',
    bodyGradient: ['#fbbf24', '#f59e0b', '#d97706'] as [string, string, string],
    glowColor: 'rgba(251,191,36,0.25)',
    glowColorStrong: 'rgba(251,191,36,0.08)',
    auraClass: 'mascot-aura-tired',
    bodyClass: 'mascot-body-tired',
    textColor: '#fbbf24',
  },
  sad: {
    label: 'Exhausted',
    sublabel: 'Time to recover',
    bodyGradient: ['#f87171', '#ef4444', '#dc2626'] as [string, string, string],
    glowColor: 'rgba(248,113,113,0.22)',
    glowColorStrong: 'rgba(248,113,113,0.07)',
    auraClass: 'mascot-aura-sad',
    bodyClass: 'mascot-body-sad',
    textColor: '#f87171',
  },
};

const SESSION_TYPE_CONFIG: Record<SessionType, {
  label: string;
  sublabel: string;
  bodyGradient: [string, string, string];
  glowColor: string;
  glowColorStrong: string;
  textColor: string;
  auraClass: string;
  bodyClass: string;
}> = {
  work: {
    label: 'Work Mode',
    sublabel: 'Stay focused!',
    bodyGradient: ['#93c5fd', '#3b82f6', '#1d4ed8'],
    glowColor: 'rgba(59,130,246,0.4)',
    glowColorStrong: 'rgba(59,130,246,0.12)',
    textColor: '#60a5fa',
    auraClass: 'mascot-aura-work',
    bodyClass: 'mascot-body-work',
  },
  study: {
    label: 'Study Time',
    sublabel: 'Keep learning!',
    bodyGradient: ['#fef08a', '#facc15', '#ca8a04'],
    glowColor: 'rgba(250,204,21,0.4)',
    glowColorStrong: 'rgba(250,204,21,0.12)',
    textColor: '#fde047',
    auraClass: 'mascot-aura-study',
    bodyClass: 'mascot-body-study',
  },
  sport: {
    label: 'Active!',
    sublabel: 'Push your limits!',
    bodyGradient: ['#86efac', '#22c55e', '#15803d'],
    glowColor: 'rgba(34,197,94,0.4)',
    glowColorStrong: 'rgba(34,197,94,0.12)',
    textColor: '#4ade80',
    auraClass: 'mascot-aura-sport',
    bodyClass: 'mascot-body-sport',
  },
  hobby: {
    label: 'Hobby Time',
    sublabel: 'Enjoy yourself!',
    bodyGradient: ['#f0abfc', '#c084fc', '#9333ea'],
    glowColor: 'rgba(192,132,252,0.4)',
    glowColorStrong: 'rgba(192,132,252,0.12)',
    textColor: '#d946ef',
    auraClass: 'mascot-aura-hobby',
    bodyClass: 'mascot-body-hobby',
  },
};

function SessionAccessories({ sessionType }: { sessionType: SessionType }) {
  if (sessionType === 'work') {
    return (
      <g opacity="0.92">
        <rect x="137" y="155" width="25" height="18" rx="3" fill="#1e40af" />
        <path d="M142 155 V152 Q149.5 148 157 152 V155" stroke="#93c5fd" strokeWidth="2" fill="none" strokeLinecap="round" />
        <line x1="137" y1="164" x2="162" y2="164" stroke="#3b82f6" strokeWidth="1" />
        <rect x="147" y="161" width="5" height="6" rx="1.5" fill="#93c5fd" />
        <line x1="141" y1="158" x2="158" y2="158" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5" />
        <line x1="141" y1="161" x2="152" y2="161" stroke="#60a5fa" strokeWidth="0.8" opacity="0.3" />
      </g>
    );
  }
  if (sessionType === 'study') {
    return (
      <g opacity="0.92">
        <rect x="57" y="65" width="86" height="9" rx="2.5" fill="#854d0e" />
        <rect x="71" y="53" width="58" height="14" rx="3" fill="#a16207" />
        <line x1="129" y1="60" x2="138" y2="76" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="134" y="74" width="8" height="11" rx="2.5" fill="#fde047" />
        <rect x="74" y="55" width="20" height="5" rx="2" fill="white" opacity="0.12" />
      </g>
    );
  }
  if (sessionType === 'sport') {
    return (
      <g opacity="0.88">
        <path
          d="M 38 118 L 47 100 L 42 100 L 51 82"
          stroke="#22c55e" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M 162 118 L 153 100 L 158 100 L 149 82"
          stroke="#22c55e" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />
        <ellipse cx="148" cy="72" rx="3.5" ry="4.5" fill="rgba(147,197,253,0.75)" />
        <ellipse cx="160" cy="88" rx="2.5" ry="3.5" fill="rgba(147,197,253,0.55)" />
        <ellipse cx="154" cy="62" rx="2" ry="3" fill="rgba(147,197,253,0.4)" />
      </g>
    );
  }
  if (sessionType === 'hobby') {
    return (
      <g>
        <line x1="149" y1="132" x2="165" y2="162" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
        <text x="158" y="130" fontSize="20" fill="#fbbf24" className="mascot-sparkle-1">★</text>
        <text x="32" y="95" fontSize="11" fill="#f0abfc" className="mascot-sparkle-2">✦</text>
        <text x="162" y="64" fontSize="9" fill="#c084fc" className="mascot-sparkle-3">✦</text>
        <text x="26" y="125" fontSize="8" fill="#d946ef" className="mascot-sparkle-1">✦</text>
        <text x="168" y="108" fontSize="7" fill="#f0abfc" className="mascot-sparkle-2">✦</text>
      </g>
    );
  }
  return null;
}

function CharacterSVG({
  mood,
  sessionType,
  bodyGradient,
  glowColor,
}: {
  mood: MoodType;
  sessionType?: SessionType;
  bodyGradient: [string, string, string];
  glowColor: string;
}) {
  const [g1, g2, g3] = bodyGradient;
  const uid = sessionType ?? mood;

  const eyes = useMemo(() => {
    if (mood === 'inspired') {
      return (
        <>
          <path d="M 82 108 Q 88 102 94 108" stroke="#1e1b4b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 106 108 Q 112 102 118 108" stroke="#1e1b4b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="96" cy="104" r="1.5" fill="white" opacity="0.9" />
          <circle cx="120" cy="104" r="1.5" fill="white" opacity="0.9" />
        </>
      );
    }
    if (mood === 'happy') {
      return (
        <>
          <circle cx="88" cy="107" r="5" fill="#1e1b4b" />
          <circle cx="112" cy="107" r="5" fill="#1e1b4b" />
          <circle cx="90" cy="105.5" r="1.5" fill="white" opacity="0.8" />
          <circle cx="114" cy="105.5" r="1.5" fill="white" opacity="0.8" />
        </>
      );
    }
    if (mood === 'tired') {
      return (
        <>
          <ellipse cx="88" cy="109" rx="5" ry="3.5" fill="#1e1b4b" />
          <ellipse cx="112" cy="109" rx="5" ry="3.5" fill="#1e1b4b" />
          <path d="M 83 107 Q 88 103 93 107" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 107 107 Q 112 103 117 107" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      );
    }
    return (
      <>
        <path d="M 83 110 Q 88 105 93 110" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 107 110 Q 112 105 117 110" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="85" cy="116" rx="2" ry="3" fill="rgba(147,197,253,0.7)" />
      </>
    );
  }, [mood]);

  const mouth = useMemo(() => {
    if (mood === 'inspired') {
      return <path d="M 90 122 Q 100 132 110 122" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'happy') {
      return <path d="M 91 122 Q 100 129 109 122" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'tired') {
      return <line x1="92" y1="124" x2="108" y2="124" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />;
    }
    return <path d="M 91 128 Q 100 121 109 128" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  }, [mood]);

  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: `drop-shadow(0 8px 24px ${glowColor})` }}
    >
      <defs>
        <radialGradient id={`bodyGrad-${uid}`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor={g1} />
          <stop offset="55%" stopColor={g2} />
          <stop offset="100%" stopColor={g3} />
        </radialGradient>
        <radialGradient id={`shineGrad-${uid}`} cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${uid}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <ellipse cx="100" cy="232" rx="32" ry="6" fill="black" opacity="0.18" />

      <rect x="48" y="130" width="22" height="34" rx="11" fill={`url(#bodyGrad-${uid})`} opacity="0.92" style={{ filter: `drop-shadow(0 2px 6px ${glowColor})` }} />
      <rect x="130" y="130" width="22" height="34" rx="11" fill={`url(#bodyGrad-${uid})`} opacity="0.92" style={{ filter: `drop-shadow(0 2px 6px ${glowColor})` }} />

      <rect x="72" y="188" width="20" height="36" rx="10" fill={`url(#bodyGrad-${uid})`} opacity="0.88" />
      <rect x="108" y="188" width="20" height="36" rx="10" fill={`url(#bodyGrad-${uid})`} opacity="0.88" />

      <rect x="62" y="138" width="76" height="60" rx="20" fill={`url(#bodyGrad-${uid})`} />

      <rect x="65" y="76" width="70" height="72" rx="24" fill={`url(#bodyGrad-${uid})`} />
      <rect x="65" y="76" width="70" height="72" rx="24" fill={`url(#shineGrad-${uid})`} />

      {eyes}

      {mouth}

      {sessionType ? (
        <SessionAccessories sessionType={sessionType} />
      ) : (
        <>
          {mood === 'inspired' && (
            <>
              <text x="42" y="88" fontSize="14" className="mascot-sparkle-1">✦</text>
              <text x="152" y="100" fontSize="10" className="mascot-sparkle-2">✦</text>
              <text x="148" y="72" fontSize="12" className="mascot-sparkle-3">★</text>
              <text x="38" y="115" fontSize="8" className="mascot-sparkle-2">✦</text>
            </>
          )}
          {mood === 'tired' && (
            <>
              <text x="148" y="82" fontSize="12" fill={g2} opacity="0.7" className="mascot-zzz-1">z</text>
              <text x="158" y="70" fontSize="10" fill={g2} opacity="0.5" className="mascot-zzz-2">z</text>
              <text x="166" y="60" fontSize="8" fill={g2} opacity="0.35" className="mascot-zzz-3">z</text>
            </>
          )}
        </>
      )}
    </svg>
  );
}

export function CharacterMascot({ energy, sessionType, size = 'normal', areaColor, showSublabel = false, sessionHours }: CharacterMascotProps) {
  const mood = getMood(energy);
  const moodConfig = MOOD_CONFIG[mood];
  const sessionConfig = sessionType ? SESSION_TYPE_CONFIG[sessionType] : null;
  const dynamicConfig = !sessionType && areaColor ? getDynamicConfig(areaColor) : null;

  const config = sessionConfig ?? dynamicConfig ?? moodConfig;
  const bodyGradient = config.bodyGradient;
  const glowColor = config.glowColor;

  const isCompact = size === 'compact';
  const bodyWidth = size === 'large' ? 145 : isCompact ? 90 : 130;
  const bodyHeight = size === 'large' ? 174 : isCompact ? 108 : 155;
  const auraSize = size === 'large' ? 200 : isCompact ? 120 : 160;

  const label = sessionConfig ? sessionConfig.label : moodConfig.label;
  const sublabel = sessionConfig ? sessionConfig.sublabel : moodConfig.sublabel;

  return (
    <>
      <style>{`
        @keyframes mascot-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes mascot-bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          40% { transform: translateY(-14px) scale(1.03); }
          60% { transform: translateY(-12px) scale(1.03); }
        }
        @keyframes mascot-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes mascot-droop {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(3px) rotate(1deg); }
        }
        @keyframes mascot-pulse-aura {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.06); }
        }
        @keyframes mascot-sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
        }
        @keyframes mascot-zzz {
          0% { opacity: 0; transform: translateY(0) translateX(0); }
          30% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-16px) translateX(6px); }
        }

        .mascot-body-inspired { animation: mascot-bounce 1.8s ease-in-out infinite; }
        .mascot-body-happy    { animation: mascot-float 2.4s ease-in-out infinite; }
        .mascot-body-tired    { animation: mascot-sway 3.5s ease-in-out infinite; }
        .mascot-body-sad      { animation: mascot-droop 4s ease-in-out infinite; }

        .mascot-body-work     { animation: mascot-float 2.2s ease-in-out infinite; }
        .mascot-body-study    { animation: mascot-sway 3.2s ease-in-out infinite; }
        .mascot-body-sport    { animation: mascot-bounce 1.5s ease-in-out infinite; }
        .mascot-body-hobby    { animation: mascot-float 2.0s ease-in-out infinite; }

        .mascot-aura-inspired { animation: mascot-pulse-aura 1.6s ease-in-out infinite; }
        .mascot-aura-happy    { animation: mascot-pulse-aura 2.4s ease-in-out infinite; }
        .mascot-aura-tired    { animation: mascot-pulse-aura 3.5s ease-in-out infinite; }
        .mascot-aura-sad      { animation: mascot-pulse-aura 4.5s ease-in-out infinite; }

        .mascot-aura-work     { animation: mascot-pulse-aura 2.2s ease-in-out infinite; }
        .mascot-aura-study    { animation: mascot-pulse-aura 3.0s ease-in-out infinite; }
        .mascot-aura-sport    { animation: mascot-pulse-aura 1.5s ease-in-out infinite; }
        .mascot-aura-hobby    { animation: mascot-pulse-aura 2.0s ease-in-out infinite; }

        .mascot-sparkle-1 { animation: mascot-sparkle 1.4s ease-in-out infinite; fill: #fef08a; }
        .mascot-sparkle-2 { animation: mascot-sparkle 1.4s ease-in-out infinite 0.45s; fill: #fef08a; }
        .mascot-sparkle-3 { animation: mascot-sparkle 1.4s ease-in-out infinite 0.9s; fill: #fef08a; }
        .mascot-zzz-1 { animation: mascot-zzz 2.2s ease-in-out infinite; }
        .mascot-zzz-2 { animation: mascot-zzz 2.2s ease-in-out infinite 0.55s; }
        .mascot-zzz-3 { animation: mascot-zzz 2.2s ease-in-out infinite 1.1s; }
      `}</style>

      <div className={`flex flex-col items-center ${isCompact ? 'gap-1' : 'gap-3'}`}>
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute rounded-full ${config.auraClass}`}
            style={{
              width: auraSize,
              height: auraSize,
              background: `radial-gradient(circle, ${config.glowColor} 0%, ${config.glowColorStrong} 55%, transparent 75%)`,
            }}
          />

          <div
            className={`relative z-10 ${config.bodyClass}`}
            style={{ width: bodyWidth, height: bodyHeight }}
          >
            <CharacterSVG
              mood={mood}
              sessionType={sessionType}
              bodyGradient={bodyGradient}
              glowColor={glowColor}
            />
          </div>
        </div>

        {size !== 'normal' ? (
          showSublabel ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-semibold tracking-wide" style={{ color: config.textColor }}>
                {label}
              </span>
              <span className="text-xs text-gray-400">{sublabel}</span>
              {sessionHours && (
                <div className="w-32 flex flex-col items-center gap-1 mt-2">
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((sessionHours.committed / sessionHours.planned) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${bodyGradient[0]}, ${bodyGradient[1]})`,
                        boxShadow: `0 0 8px ${glowColor}`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {sessionHours.committed.toFixed(1)}h / {sessionHours.planned.toFixed(1)}h
                  </span>
                </div>
              )}
            </div>
          ) : null
        ) : (
          <>
            <div className="flex flex-col items-center gap-1">
              <span className="text-base font-bold tracking-wide" style={{ color: config.textColor }}>
                {label}
              </span>
              <span className="text-xs text-gray-400">{sublabel}</span>
            </div>

            <div className="w-32 flex flex-col items-center gap-1">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(energy / 10) * 100}%`,
                    background: `linear-gradient(90deg, ${bodyGradient[0]}, ${bodyGradient[1]})`,
                    boxShadow: `0 0 8px ${glowColor}`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">{energy}/10 energy</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
