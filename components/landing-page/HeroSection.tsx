'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { SignUpButton } from "@clerk/nextjs";
import { ROUTES } from "@/lib/utils/constants";

interface HeroSectionProps {
  clerkId: string | null;
  setupDone: boolean;
}

export default function HeroSection({ clerkId, setupDone }: HeroSectionProps) {
  return (
    <section className="relative w-full flex flex-col items-center overflow-hidden">
      {/* Orbiting Floating Cards Container (moved out of main to avoid container stretching) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full max-w-7xl h-full mx-auto px-margin-desktop">
          {/* Profile Card */}
          <div 
            className="glass-card absolute top-[20%] left-[2%] xl:left-[1%] w-[200px] p-4 rounded-xl shadow-lg border border-outline-variant/30 rotate-[-3deg]" 
          >
            <div className="flex items-center gap-3">
              <img 
                className="w-10 h-10 rounded-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA522ZikaatD2rbOX2ltKKTnjdrewNdBVL6eZfzrSYbasoKoSi3KWZoOS41Tpau3tngsBHTrXUfMkFpvARUD8jnllydpA5sLDcU-2RtrOvWUmAj6hPsPxEx5EW4iCeZ95--6cYWs7xfcmpFegO2RAfiDZZJzIkV__kE2JVcC8-f4nXMPtjcjM3QHbsUD12YULoj0Y3XiiSB4t2-02If28Ozj2qTMUgYyzlbI12eoOue_uVqYS-yN6ZA733PCBKx_qKPgqU6LHzf7D8"
                alt="Aarav Mehta"
              />
              <div className="text-left">
                <p className="font-bold text-xs text-on-surface">Aarav Mehta</p>
                <p className="text-[10px] text-on-surface-variant">Interview Ready</p>
              </div>
            </div>
          </div>
          
          {/* Streak Card */}
          <div 
            className="glass-card absolute top-[40%] right-[2%] xl:right-[1%] w-[160px] p-4 rounded-xl shadow-lg border border-outline-variant/30 rotate-[2deg]" 
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-500 !text-[20px]">local_fire_department</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-none text-on-surface">12</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Day Streak</p>
              </div>
            </div>
          </div>
          
          {/* Score Card */}
          <div 
            className="glass-card absolute bottom-[25%] left-[1%] xl:left-0 w-[180px] p-5 rounded-2xl shadow-lg border border-outline-variant/30 rotate-[-2deg]" 
          >
            <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" fill="transparent" r="28" stroke="#F1F3F8" strokeWidth="6"></circle>
                <circle cx="32" cy="32" fill="transparent" r="28" stroke="#635BFF" strokeDasharray="176" stroke-dashoffset="30" strokeLinecap="round" strokeWidth="6"></circle>
              </svg>
              <span className="absolute font-bold text-lg">85</span>
            </div>
            <p className="text-[11px] font-bold text-on-surface">Skill Score</p>
          </div>
          
          {/* Badge Card */}
          <div 
            className="glass-card absolute bottom-[40%] right-[1%] xl:right-0 w-[140px] p-4 rounded-xl shadow-lg border border-outline-variant/30 rotate-[3deg]" 
          >
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-amber-500 !text-[40px] mb-1">workspace_premium</span>
              <p className="text-[11px] font-bold">L4 Certified</p>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-7xl pt-[180px] px-margin-desktop flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="font-display-lg text-[100px] leading-[1.0] font-[800] text-on-surface max-w-[900px]">
          Clutch your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635BFF] to-[#8B7FFF] hero-underline">
            interviews
            <div className="sparkle -top-6 -right-10 opacity-60"></div>
            <div className="sparkle -bottom-2 -left-6 scale-75 opacity-30"></div>
          </span>
        </h1>
        
        {/* Subheading */}
        <p className="font-body-lg text-[26px] text-on-surface-variant max-w-[650px] leading-relaxed mt-10">
          Practice with AI mock interviews, get instant feedback, and land your dream role with confidence.
        </p>
        
        {/* CTAs */}
        <div className="flex items-center gap-6 mt-12 mb-20">
          {!clerkId && (
            <SignUpButton mode="modal">
              <button className="bg-on-surface text-white h-[64px] px-10 rounded-full font-label-md text-label-md flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl group cursor-pointer">
                Start Practicing Now
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">arrow_forward</span>
                </div>
              </button>
            </SignUpButton>
          )}
          {clerkId && !setupDone && (
            <Link href={ROUTES.onboarding}>
              <button className="bg-on-surface text-white h-[64px] px-10 rounded-full font-label-md text-label-md flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl group cursor-pointer">
                Continue Setup
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">arrow_forward</span>
                </div>
              </button>
            </Link>
          )}
          {clerkId && setupDone && (
            <Link href={ROUTES.interview}>
              <button className="bg-on-surface text-white h-[64px] px-10 rounded-full font-label-md text-label-md flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl group cursor-pointer">
                Start Practicing
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">arrow_forward</span>
                </div>
              </button>
            </Link>
          )}
          <Link href="#how-it-works">
            <button className="bg-white border border-outline-variant h-[64px] px-10 rounded-full font-label-md text-label-md flex items-center gap-3 hover:bg-surface-container-low transition-all cursor-pointer">
              See How It Works
              <div className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined !text-[18px]">play_arrow</span>
              </div>
            </button>
          </Link>
        </div>
        
        {/* Main Dashboard Card */}
        <div className="relative w-full max-w-4xl z-30 mb-16">
          <div className="glass-card w-full p-10 rounded-[32px] text-left border border-white/40 shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-secondary-container/10 flex items-center justify-center relative">
                  <img 
                    className="w-full h-full object-cover rounded-full" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfmEHbLapXsh4Za20wBN9I2ZYhJPNQ_77ntLis3jNV6bjnCjqb-bOH9w6cfznF3wLzZOeNzCUzf8nOmis66H65iIOMA7FN7ss4dD08CRzkLIBS2g8-AvMX-5mliSHXYWZ5wpp6M9AALIsSHiwPZwn-tx5-D8SZTRxBR9cj3ou6aYq53xSM_6TOJTrxHL_LwapR60rn-XgfboPXp5fMsYUbz97Fy8jTtujKciPt6VEixfwwyKOJ17alv9nOo1QfCBhr0ljThVqxwkU"
                    alt="AI Mock Interview"
                  />
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-on-surface">AI Mock Interview</h4>
                  <p className="text-lg text-on-surface-variant">Senior Software Engineer - Google Prep</p>
                </div>
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-ping"></div>
                LIVE SESSION
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="bg-surface-container-low p-6 rounded-2xl">
                  <p className="text-lg leading-relaxed text-on-surface italic">"Can you describe a situation where you had to lead a project under extreme technical pressure? What was your approach to risk management?"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5 items-end h-10">
                    <div className="w-1.5 bg-primary h-5 rounded-full animate-pulse"></div>
                    <div className="w-1.5 bg-primary h-8 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-1.5 bg-primary h-4 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    <div className="w-1.5 bg-primary h-10 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                    <div className="w-1.5 bg-primary h-7 rounded-full animate-pulse [animation-delay:0.3s]"></div>
                  </div>
                  <span className="font-semibold text-primary">Capturing response...</span>
                </div>
              </div>
              
              <div className="border-l border-outline-variant/30 pl-10 space-y-6">
                <div className="flex items-center gap-4">
                  <img 
                    className="w-12 h-12 rounded-xl object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsOJ5gS2_ULL5-_BakdLi8exKLN5D5DdGCxff8SxX83PdA3aV45JFqeTIEEZTVU5kBslEYipVbWgx_zHy6AATaI6GnBy2j-smIGiPQw4jBcj4BRyS-hpdJdDyO48jpB3wjsLIrjNpf4ReKQvCKkv_OuEi8ly-WGHT3mC1b0JMULJNxHP3KT0cUNM9K2BxlBqLo7QVEhztG6wk8Isi97wzSFGMyOVuv4q0R9xIFyw05fmesa4CgbeesFq_duDJg0QuDSeFcBWLgfm4"
                    alt="Coach"
                  />
                  <div>
                    <p className="font-bold text-on-surface">Coach Feedback</p>
                    <p className="text-xs text-on-surface-variant">Olivia Wouters, Senior Eng @ Google</p>
                  </div>
                </div>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  "Excellent use of the STAR method. Consider highlighting the specific technical trade-offs you made during the crisis to demonstrate deeper architecture awareness."
                </p>
                <div className="flex gap-3">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg">High Impact</span>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg">Concise</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Logos */}
        <div className="mt-8 flex flex-col items-center gap-6 z-10 relative">
          <span className="text-[11px] font-bold text-[#9CA3AF] tracking-[0.2em] uppercase">
            PRE-INSTALLED TEMPLATES FOR
          </span>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-6 font-display-md text-headline-md font-bold tracking-tight">
            <span>
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </span>
            <span className="text-[#00A4EF]">Microsoft</span>
            <span className="text-[#FF9900]">Amazon</span>
            <span className="text-[#0081FB]">Meta</span>
            <span className="text-[#76B900]">NVIDIA</span>
          </div>
        </div>


      </main>
      

    </section>
  );
}
