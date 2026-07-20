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

      <main className="relative z-10 w-full max-w-7xl pt-[130px] px-margin-desktop flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="font-display-lg text-[48px] md:text-[64px] leading-[1.1] font-[800] text-on-surface max-w-[800px] tracking-tight">
          Clutch your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635BFF] to-[#8B7FFF] hero-underline">
            interviews
            <div className="sparkle -top-5 -right-8 opacity-60"></div>
            <div className="sparkle -bottom-2 -left-5 scale-75 opacity-30"></div>
          </span>
        </h1>
        
        {/* Subheading */}
        <p className="font-body-lg text-[18px] md:text-[20px] text-on-surface-variant max-w-[600px] leading-relaxed mt-8">
          Practice with AI mock interviews, get instant feedback, and land your dream role with confidence.
        </p>
        
        {/* CTAs */}
        <div className="flex items-center gap-4 mt-8 mb-12">
          {!clerkId && (
            <SignUpButton mode="modal">
              <button className="bg-on-surface text-white h-[52px] px-8 rounded-full font-label-md text-label-md flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl group cursor-pointer">
                Start Practicing Now
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                </div>
              </button>
            </SignUpButton>
          )}
          {clerkId && !setupDone && (
            <Link href={ROUTES.onboarding}>
              <button className="bg-on-surface text-white h-[52px] px-8 rounded-full font-label-md text-label-md flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl group cursor-pointer">
                Continue Setup
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                </div>
              </button>
            </Link>
          )}
          {clerkId && setupDone && (
            <Link href={ROUTES.interview}>
              <button className="bg-on-surface text-white h-[52px] px-8 rounded-full font-label-md text-label-md flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl group cursor-pointer">
                Start Practicing
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                </div>
              </button>
            </Link>
          )}
          <Link href="#how-it-works">
            <button className="bg-white border border-outline-variant h-[52px] px-8 rounded-full font-label-md text-label-md flex items-center gap-3 hover:bg-surface-container-low transition-all cursor-pointer">
              See How It Works
              <div className="w-7 h-7 rounded-full border border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined !text-[16px]">play_arrow</span>
              </div>
            </button>
          </Link>
        </div>
        
        {/* Main Dashboard Card */}
        <div className="relative w-full max-w-4xl z-30 mb-12 px-4 md:px-0">
          {/* Desktop Image */}
          <img 
            className="hidden md:block w-full h-auto rounded-[24px] shadow-2xl border border-outline-variant/20"
            src="/Demo.png"
            alt="Clutchly AI Interview Coach & Analytics Demo"
          />
          {/* Mobile Image */}
          <img 
            className="block md:hidden w-full h-auto rounded-[16px] shadow-xl border border-outline-variant/20"
            src="/Demo%20mobile.png"
            alt="Clutchly AI Interview Coach & Analytics Demo Mobile"
          />
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
